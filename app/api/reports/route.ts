import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { csv, reportData } from "@/lib/reports";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = request.nextUrl.searchParams;
    const type = params.get("type") || "transactions";

    const data = await reportData(type, {
      from: params.get("from") || undefined,
      to: params.get("to") || undefined,
    });

    if (params.get("format") === "csv") {
      const rows = Array.isArray(data) ? data : [data];

      return new NextResponse(csv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            `attachment; filename=wz-${type}.csv`,
        },
      });
    }

    return NextResponse.json({
      reports: data,
    });
  } catch (error) {
    console.error("REPORT_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil laporan",
      },
      { status: 500 }
    );
  }
}
