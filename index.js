const userGasUrl = "https://script.google.com/macros/s/AKfycby3qqMPwBnSPftm3vbuaht6teJWD4wUmtuE246Csz8gVONSEYdIJacuou_WnNUTLGJY4g/exec";

export default async function handler(req, res) {
  try {
    // ステップ①：トークン取得（未設定なら自動発行）
    const getTokenResp = await fetch(`${userGasUrl}?mode=token`);
    const tokenData = await getTokenResp.json();

    if (!tokenData.ok || !tokenData.token || !tokenData.userId) {
      throw new Error("トークンまたは userId の取得に失敗しました");
    }

    const token = tokenData.token;
    const spreadsheetId = tokenData.userId;

    // ステップ②：元の投稿データに auth・spreadsheetId を追加
    const payload = {
      ...req.body,
      auth: token,
      spreadsheetId
    };

    // ステップ③：ユーザーGASにPOST（HTML返り対策付き）
    const gasResp = await fetch(userGasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"  // ★ JSON以外のレスポンス（HTML）を防ぐ
      },
      redirect: "follow", // ★ リダイレクトを追跡
      body: JSON.stringify(payload)
    });

    const contentType = gasResp.headers.get("content-type") || "";

    // HTMLなどが返ってきた場合はエラー扱い
    if (!contentType.includes("application/json")) {
      const raw = await gasResp.text();
      return res.status(500).json({
        ok: false,
        error: "GASからJSON以外のレスポンス（おそらくHTML）が返されました",
        preview: raw.slice(0, 300)
      });
    }

    const gasResult = await gasResp.json();
    res.status(200).json(gasResult);

  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || "不明なエラー"
    });
  }
}
