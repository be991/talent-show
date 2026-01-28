import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file
 */
export const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original if compression fails
  }
};

/**
 * Uploads a file to Cloudinary
 */
export const uploadFile = async (file: File, path: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user_uploads'); // Provided by user
    formData.append('cloud_name', 'dau1mhqqw'); // Provided by user
    // Optional: Add folder/path handling if needed, but Cloudinary uses folders differently
    // formData.append('folder', path); 

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dau1mhqqw/image/upload`, 
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary (Not implemented for client-side without signature)
 * For now, we'll log a warning as this operation typically requires backend signature
 */
export const deleteFile = async (path: string) => {
  console.warn('Delete operation skipped: Cloudinary client-side delete requires signed signature which is unsafe to expose.');
  // In a real app, you'd call your own backend API to handle the deletion securely
};
