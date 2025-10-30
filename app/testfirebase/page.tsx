"use client";
import React, { useEffect } from "react";
import { db } from "@/lib/firebase";

export default function TestFirebase() {
  useEffect(() => {
    if (db) {
      console.log("✅ Firebase connection successful!");
    } else {
      console.error("❌ Firebase not initialized!");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Firebase Test Page</h1>
      <p>Open the browser console (Ctrl+Shift+I → Console tab)</p>
      <p>You should see a success message if Firebase is working.</p>
    </div>
  );
}
