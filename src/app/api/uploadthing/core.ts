import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  // Candidate & Employer Avatar Uploader (Max 2MB, Raster Images only)
  avatarUploader: f({
    'image/png': { maxFileSize: '2MB', maxFileCount: 1 },
    'image/jpeg': { maxFileSize: '2MB', maxFileCount: 1 },
    'image/webp': { maxFileSize: '2MB', maxFileCount: 1 },
    'image/gif': { maxFileSize: '2MB', maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url };
  }),

  // Candidate Resume Uploader (Max 2MB, PDF/Word/RTF only)
  resumeUploader: f({
    pdf: { maxFileSize: '2MB', maxFileCount: 1 },
    'application/msword': { maxFileSize: '2MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '2MB',
      maxFileCount: 1,
    },
    'application/rtf': { maxFileSize: '2MB', maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url };
  }),

  // Employer KYC Document Uploader (Max 4MB, PDF/PNG/JPEG)
  kycUploader: f({
    pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    'image/png': { maxFileSize: '4MB', maxFileCount: 1 },
    'image/jpeg': { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;