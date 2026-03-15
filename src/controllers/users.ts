import { Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../secrets";
import { AuthenticatedRequest } from "../types/express";
import { prismaClient } from "..";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadProfilePicture = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    //@ts-ignore
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No image file provided",
      });
    }

    const userId = req.user.id;

    // Fetch user (to get old publicId if exists)
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        cloudinaryPicturePublicId: true,
      },
    });

    // Upload image to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "uploads/images",
          resource_type: "image",
          transformation: [
            {
              quality: 50, // ~50% compression
              fetch_format: "auto", // WebP / AVIF when supported
            },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      //@ts-ignore
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    // Delete old image from Cloudinary if exists
    if (user?.cloudinaryPicturePublicId) {
      await cloudinary.uploader.destroy(user.cloudinaryPicturePublicId, {
        invalidate: true,
      });
    }

    // Update user record
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        picture: uploadResult.secure_url,
        cloudinaryPicturePublicId: uploadResult.public_id,
      },
      select: {
        id: true,
        picture: true,
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("uploadImage error:", error);

    return res.status(500).json({
      ok: false,
      message: "Unable to upload image",
    });
  }
};

export const updateProfileInfo = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({
        message: "fullname and email are required",
      });
    }

    const nameParts = fullname.trim().split(/\s+/);
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || null;

    const updatedUser = await prismaClient.user.update({
      where: { id: req.user.id },
      data: {
        firstname,
        lastname,
        email,
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("updateProfileInfo error:", error);
    return res.status(500).json({
      ok: false,
      message: "An error occurred while updating profile",
      error: error.message,
    });
  }
};
