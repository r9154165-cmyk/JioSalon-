"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { useMySalon } from "@/lib/useMySalon";
import ScissorLoader from "@/components/ScissorLoader";
import PartnerBottomNav from "@/components/PartnerBottomNav";

const CATEGORIES = ["Haircut", "Beard", "Spa", "Styling"];

export default function PartnerSettingsPage() {
  const user = useAuth();
  const router = useRouter();
  const { salonId, salon, checked } = useMySalon(user?.uid);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Haircut");
  const [isOpen, setIsOpen] = useState(true);
  const [services, setServices] = useState([]); // optional: [{ name, price }]
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      router.replace("/login");
      return;
    }
    if (checked && !salonId) router.replace("/partner/setup");
  }, [user, checked, salonId, router]);

  useEffect(() => {
    if (salon) {
      setName(salon.name || "");
      setAddress(salon.address || "");
      setCategory(salon.category || "Haircut");
      setIsOpen(salon.isOpen !== false);
      setServices(salon.services && salon.services.length > 0 ? salon.services : []);
    }
  }, [salon]);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const fileRef = ref(storage, `salon-photos/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "salons", salonId), { photoURL: url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function addServiceRow() {
    setServices((prev) => [...prev, { name: "", price: "" }]);
  }

  function updateServiceRow(index, field, value) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeServiceRow(index) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      // Only keep services with both a name and a price filled in
      const cleanServices = services
        .filter((s) => s.name.trim() && s.price !== "")
        .map((s) => ({ name: s.name.trim(), price: Number(s.price) }));

      await updateDoc(doc(db, "salons", salonId), {
        name: name.trim(),
        address: address.trim(),
        category,
        isOpen,
        services: cleanServices,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-vanilla-50 flex items-center justify-center">
        <ScissorLoader message="Loading settings" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vanilla-50 pb-24 px-6 py-8">
      <p className="text-xs uppercase tracking-widest text-cola-600">Partner</p>
      <h1 className="font-display text-2xl text-cola-800 mb-6">Salon Settings</h1>

      {/* Photo */}
      <div className="mb-6">
        <p className="text-xs text-cola-800/60 mb-2">Salon photo</p>
        <div
          className="w-full h-36 rounded-2xl bg-vanilla-100 bg-cover bg-center flex items-center justify-center overflow-hidden"
          style={salon.photoURL ? { backgroundImage: `url(${salon.photoURL})` } : {}}
        >
          {!salon.photoURL && !uploading && <span className="text-3xl">📷</span>}
          {uploading && <ScissorLoader message="Uploading" />}
        </div>
        <label className="mt-3 inline-block text-xs font-semibold bg-cola-800 text-vanilla-50 rounded-full px-4 py-2 cursor-pointer">
          {salon.photoURL ? "Change photo" : "Upload photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>
      </div>

      {/* Open / closed toggle */}
      <div className="flex items-center justify-between bg-vanilla-100 rounded-2xl px-4 py-4 mb-4">
        <div>
          <p className="text-sm font-semibold text-cola-800">Salon status</p>
          <p className="text-xs text-cola-800/50">{isOpen ? "Visible to customers" : "Hidden from customers"}</p>
        </div>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="w-14 h-8 rounded-full relative transition"
          style={{ background: isOpen ? "#C9A24B" : "#5C1620" }}
        >
          <span
            className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition"
            style={{ transform: isOpen ? "translateX(24px)" : "translateX(0)" }}
          />
        </button>
      </div>

      {/* Name / address / category */}
      <p className="text-xs text-cola-800/60 mb-2">Salon name</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-vanilla-100 rounded-2xl px-4 py-3.5 mb-4 text-cola-800 outline-none"
      />

      <p className="text-xs text-cola-800/60 mb-2">Address</p>
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full bg-vanilla-100 rounded-2xl px-4 py-3.5 mb-4 text-cola-800 outline-none"
      />

      <p className="text-xs text-cola-800/60 mb-2">Category</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="text-sm px-4 py-2 rounded-full font-semibold"
            style={
              category === c
                ? { background: "#5C1620", color: "#FBF6EC" }
                : { background: "#F5EBD6", color: "rgba(92,22,32,0.6)" }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* Optional service pricing list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-cola-800/60">Services & pricing (optional)</p>
          <button onClick={addServiceRow} className="text-xs font-semibold text-gold-dark">
            + Add service
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-xs text-cola-800/40">No services added yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={s.name}
                  onChange={(e) => updateServiceRow(i, "name", e.target.value)}
                  placeholder="e.g. Haircut"
                  className="flex-1 bg-vanilla-100 rounded-xl px-3 py-2.5 text-sm text-cola-800 outline-none"
                />
                <input
                  value={s.price}
                  onChange={(e) => updateServiceRow(i, "price", e.target.value.replace(/\D/g, ""))}
                  placeholder="₹"
                  className="w-20 bg-vanilla-100 rounded-xl px-3 py-2.5 text-sm text-cola-800 outline-none"
                />
                <button onClick={() => removeServiceRow(i)} className="text-cola-800/40 text-sm px-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-b from-gold to-gold-dark text-cola-950 font-bold rounded-2xl py-3.5 text-sm disabled:opacity-60"
      >
        {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
      </button>

      <PartnerBottomNav />
    </div>
  );
}
