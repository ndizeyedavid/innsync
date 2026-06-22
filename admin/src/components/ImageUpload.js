import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { hotelManagerAPI } from "services/hotelManager";

export default function ImageUpload({ value, onChange, label = "Image", height = 120 }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");

  const upload = useMutation({
    mutationFn: (file) => hotelManagerAPI.uploadImage(file),
    onSuccess: (res) => {
      const url = res.url;
      setPreview(url);
      onChange(url);
    },
  });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    upload.mutate(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      <MDTypography variant="caption" color="text" sx={{ mb: 0.5, display: "block", fontWeight: 500 }}>
        {label}
      </MDTypography>
      {preview ? (
        <Box sx={{ position: "relative", display: "inline-block", width: "100%" }}>
          <Box
            component="img"
            src={upload.isPending ? undefined : preview}
            sx={{ width: "100%", height, borderRadius: 1, objectFit: "cover", opacity: upload.isPending ? 0.5 : 1 }}
          />
          {upload.isPending && (
            <CircularProgress size={24} sx={{ position: "absolute", top: "50%", left: "50%", mt: -1.5, ml: -1.5 }} />
          )}
          <Box sx={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 0.5 }}>
            <IconButton size="small" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              onClick={() => inputRef.current?.click()}>
              <span style={{ fontSize: 14 }}>🖊</span>
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "rgba(0,0,0,0.5)", color: "#fff", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
              onClick={handleRemove}>
              <span style={{ fontSize: 14 }}>✕</span>
            </IconButton>
          </Box>
        </Box>
      ) : (
        <MDButton variant="outlined" color="secondary" size="small" fullWidth
          onClick={() => inputRef.current?.click()} disabled={upload.isPending}
          sx={{ height, borderStyle: "dashed" }}>
          {upload.isPending ? "Uploading..." : `📷 Upload ${label}`}
        </MDButton>
      )}
    </Box>
  );
}
