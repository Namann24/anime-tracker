import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb("Images only!");
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post("/", upload.single("image"), (req, res) => {
    if (req.file) {
        // Return path relative to server root, assuming served via /uploads
        // Normalize backslashes to forward slashes for URLs
        const filePath = `/${req.file.path.replace(/\\/g, "/")}`;
        res.send(filePath);
    } else {
        res.status(400).send("No image uploaded");
    }
});

export default router;
