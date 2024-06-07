import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload local file to cloudinary
    const response = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" },
      function (error, result) {
        console.log(result);
      }
    );
    console.log("file upload to cloudinary successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); //remove locally saved temp file as the upload operation got failed
    return null;
  }
};

const extractPublicIdFromUrl = (url) => {
  // Extract the part of the URL between "/upload/" and the file extension
  const urlParts = url.split('/');
  const filePart = urlParts[urlParts.length - 1]; // "sample.jpg"
  const fileName = filePart.split('.')[0]; // "sample"
  // const publicId = urlParts.slice(urlParts.indexOf('upload') + 1).join('/').replace(`/${filePart}`, `/${fileName}`);
  // return publicId;
  return fileName
};

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = extractPublicIdFromUrl(url);
    const response = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    console.log("File deleted from Cloudinary successfully", response);
    return response;
  } catch (error) {
    console.log("Error deleting file from Cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
