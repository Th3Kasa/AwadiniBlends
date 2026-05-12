"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface FormState {
  name: string;
  email: string;
  message: string;
}

const initialForm: FormState = { name: "", email: "", message: "" };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<FormState & { image: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Partial<FormState & { image: string }> = {};
    if (!form.name || form.name.length < 2)
      newErrors.name = "Name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Valid email is required";
    if (!form.message || form.message.length < 10)
      newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Only JPEG, PNG, WebP, or GIF images are allowed." }));
      return;
    }

    // Client-side size check
    if (file.size > MAX_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 5MB." }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Convert image to base64 if present
      let imageBase64: string | null = null;
      let imageType: string | null = null;
      let imageName: string | null = null;

      if (imageFile) {
        imageBase64 = imagePreview?.split(",")[1] ?? null; // strip data URL prefix
        imageType = imageFile.type;
        imageName = imageFile.name;
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          imageBase64,
          imageType,
          imageName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
      setForm(initialForm);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gold">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-sans font-bold text-lg text-mahogany mb-2 tracking-wider uppercase">Message Received</h3>
        <p className="text-mahogany/70 text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-[11px] tracking-wider uppercase text-mahogany/70 mb-2">
            Your Name
          </label>
          <input
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange} autoComplete="name"
            className={`w-full bg-white border rounded-sm px-4 py-3 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors ${errors.name ? "border-red-400/60" : "border-mahogany/20"}`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-[11px] tracking-wider uppercase text-mahogany/70 mb-2">
            Email Address
          </label>
          <input
            id="email" name="email" type="email"
            value={form.email} onChange={handleChange} autoComplete="email"
            className={`w-full bg-white border rounded-sm px-4 py-3 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors ${errors.email ? "border-red-400/60" : "border-mahogany/20"}`}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-[11px] tracking-wider uppercase text-mahogany/70 mb-2">
          Message
        </label>
        <textarea
          id="message" name="message" rows={6}
          value={form.message} onChange={handleChange}
          className={`w-full bg-white border rounded-sm px-4 py-3 text-sm text-mahogany placeholder:text-mahogany/30 focus:outline-none focus:border-gold transition-colors resize-none ${errors.message ? "border-red-400/60" : "border-mahogany/20"}`}
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
        <p className="text-[11px] text-mahogany/40 mt-1 text-right">{form.message.length}/2000</p>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-[11px] tracking-wider uppercase text-mahogany/70 mb-2">
          Attach Image <span className="text-mahogany/40 normal-case">(optional — JPEG, PNG, WebP or GIF, max 5MB)</span>
        </label>

        {imagePreview ? (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 rounded-md overflow-hidden border border-mahogany/20">
              <Image src={imagePreview} alt="Attachment preview" fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-mahogany text-white flex items-center justify-center text-xs hover:bg-mahogany/80 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-mahogany/20 rounded-sm cursor-pointer hover:border-gold/50 hover:bg-gold/3 transition-colors"
          >
            <svg className="w-6 h-6 text-mahogany/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs text-mahogany/40">Click to upload an image</span>
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}

        {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
      </div>

      {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </motion.button>
    </motion.form>
  );
}
