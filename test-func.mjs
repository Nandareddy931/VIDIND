const testUrl = "https://vidind-admin-backend.pnuuumwhlxvyvkeujzng.functions.supabase.co/vidind-admin-backend";

async function test() {
  try {
    const res = await fetch(testUrl, {
      method: "POST"
    });
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}
test();
