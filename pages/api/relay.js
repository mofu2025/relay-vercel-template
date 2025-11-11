// pages/api/relay.js
// ✅ GPT→Relay→GAS 中継サーバー（Vercel）
// ✅ 2025-11-12: spreadsheetId 自動補完＋形式検証付き 安定版

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    let { auth, spreadsheetId, post, product, style, format, tags } = req.body;

    // ✅ spreadsheetId が未指定または形式不正なら自動取得
    const isInvalidSheetId =
      !spreadsheetId ||
      spreadsheetId === "undefined" ||
      spreadsheetId === "" ||
      spreadsheetId.length < 20; // GoogleシートIDは通常44文字前後

    if (isInvalidSheetId) {
      const tokenResp = await fetch(
        "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec",
        { method: "GET", headers: { Accept: "application/json" } }
      );

      const rawText = await tokenResp.text();
      console.log("🛰 GAS応答内容:", rawText);

      try {
        const tokenJson = JSON.parse(rawText);
        spreadsheetId = tokenJson.userId || "";
        console.log("🔁 自動取得: spreadsheetId =", spreadsheetId);
      } catch (jsonErr) {
        console.error("💥 JSON解析エラー:", jsonErr.message);
        throw new Error("GAS応答がJSON形式ではありません");
      }
    }

    if (!auth || !spreadsheetId || !post) {
      console.error("🚫 不足:", { auth, spreadsheetId, post });
      throw new Error("auth, spreadsheetId, post が不足しています");
    }

    const gasUrl =
      "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

    const payload = {
      mode: "post",
      auth,
      spreadsheetId,
      post,
      product: product || "",
      style: style || "",
      format: format || "",
      tags: tags || [],
    };

    console.log("🚀 Relay → GAS payload:", payload);

    const gasResp = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = gasResp.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await gasResp.json()
      : await gasResp.text();

    console.log("📡 GAS応答:", result);

    res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error("💥 Relay内部エラー:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
}
