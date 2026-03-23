import { CREATED } from "../core/success.response.js";
import { BadRequestError } from "../core/error.response.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) throw new BadRequestError("No file provided");

    const { originalname, mimetype, buffer } = req.file;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "chat-uploads",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(buffer);
    });

    new CREATED({
      message: "File uploaded",
      metadata: {
        fileName: originalname,
        fileUrl: result.secure_url,
        fileType: mimetype,
      },
    }).send(res);
  } catch (error) {
    next(error);
  }
};
