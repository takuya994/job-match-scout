import { GoogleGenAI } from "@google/genai";
import { Company, JobRequirement } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to extract JSON from model response which might contain markdown or extra text
const extractJson = (text: string): any => {
  try {
    // First try to match code blocks specifically
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // Fallback: finding the first JSON-like structure
    const startBrace = text.indexOf('{');
    const startBracket = text.indexOf('[');
    
    let start = -1;
    let end = -1;
    
    // Detect if we are looking for an object or array
    if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
      start = startBrace;
      end = text.lastIndexOf('}');
    } else if (startBracket !== -1) {
      start = startBracket;
      end = text.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }

    // Last resort: try parsing the whole text
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON from model response", text);
    return null;
  }
};

// Renamed from searchFusionCompanies to searchCompanies to reflect generic usage
export const searchCompanies = async (criteria: string): Promise<Company[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    あなたは優秀な市場リサーチャーです。
    ユーザーが指定した以下の【検索条件】に合致する、または関連性の高い企業を調査・リストアップしてください。

    【検索条件】
    「${criteria}」
    
    【検索方針】
    - 日本国内の企業を優先してください。または日本に拠点を持つ主要なグローバル企業。
    - 会社四季報（Kaisha Shikiho）、日経、企業プレスリリース、業界ニュースなどの信頼できる情報源を使用してください。
    - 大手企業だけでなく、条件に合致する有力なスタートアップや中小企業も視野に入れてください。
    
    【出力形式】
    - 結果は **必ず日本語で** 出力してください。
    - **有効なJSON配列のみ** を返してください。Markdownフォーマットや説明文は含めないでください。
    - 各オブジェクトの構造:
      - "name": 企業名
      - "description": その企業の、検索条件に関連する事業内容や特徴の簡潔な説明（日本語）
      - "relevance": なぜこの企業が検索条件に合致するかの理由（選定理由）
      - "websiteUrl": 公式ウェブサイトのURL

    上位10社程度リストアップしてください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is NOT allowed with googleSearch tool
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = extractJson(text);
    if (Array.isArray(data)) {
      return data.map((c: any, index: number) => ({
        id: `comp-${index}-${Date.now()}`,
        name: c.name,
        description: c.description,
        relevance: c.relevance,
        websiteUrl: c.websiteUrl,
        isSelected: true, // Default to selected
      }));
    }
    return [];
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};

export const analyzeCompanyJobs = async (
  companyName: string, 
  userCriteria: string
): Promise<{ jobs: JobRequirement[], summary: string }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    あなたは専門の採用コンサルタントです。
    企業名: 「${companyName}」 の現在の求人情報を調査してください。
    
    企業の公式採用サイトや主要な求人メディアを検索し、以下の【ユーザー基準】に合致する求人を厳しくスクリーニングしてください。

    【ユーザー基準】
    "${userCriteria}"
    
    ※注意点:
    - ユーザー基準に特定の条件（「大卒不問」「未経験可」「職種指定」など）がある場合は、それに合致する職種を幅広く探してください。
    - 求人情報は日本国内の募集を優先してください。
    
    【出力形式】
    - 結果は **必ず日本語で** 出力してください。
    - **有効なJSONオブジェクトのみ** を返してください。
    - 構造:
    {
      "summary": "ユーザー基準に対する企業の採用姿勢や状況の要約（日本語）",
      "jobs": [
        {
           "role": "職種名（日本語）",
           "description": "仕事内容の概要",
           "requirements": ["応募要件1", "応募要件2"],
           "educationLevel": "高卒/高専卒/大卒/不問 など",
           "employmentType": "正社員/契約社員 など",
           "matchScore": 85 (0-100の数値),
           "matchReason": "なぜこの求人がユーザー基準に合うかの説明",
           "url": "求人情報のURL（判明した場合）"
        }
      ]
    }
    
    具体的な求人が見つからない場合は、空の配列を返し、summaryフィールドでその理由や一般的な採用傾向（例：「現在は新卒研究職のみ募集しているようです」）を説明してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" is NOT allowed with googleSearch tool
      },
    });

    const text = response.text;
    if (!text) return { jobs: [], summary: "データが見つかりませんでした。" };

    const data = extractJson(text);
    if (!data) return { jobs: [], summary: "分析結果の解析に失敗しました。" };

    return {
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      summary: data.summary || "分析が完了しました。",
    };
  } catch (error) {
    console.error(`Error analyzing jobs for ${companyName}:`, error);
    return { jobs: [], summary: "企業の分析中にエラーが発生しました。" };
  }
};