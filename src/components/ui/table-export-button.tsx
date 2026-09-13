"use client"

import * as React from "react"
import * as XLSX from "xlsx"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { toast } from "sonner"

/**
 * Describes a single column to export.
 * - `key` becomes the property name in the exported row object.
 * - `header` is the column title shown in the file.
 * - `accessor` is an optional function for computed/derived values.
 */
export interface ExportColumn<T> {
  key: string
  header: string
  accessor?: (row: T, rowIndex: number) => string | number | null | undefined
}

export interface TableExportButtonProps<T> {
  /** Rows of data currently visible/filtered in the table. */
  rows: T[]
  /** Column definitions. Controls ordering + headers of the exported file. */
  columns: ExportColumn<T>[]
  /** File name without extension. */
  filename: string
  /** Optional sheet name for xlsx (max 31 chars, no special chars). Defaults to filename. */
  sheetName?: string
  disabled?: boolean
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  /** Hide the text label on small screens (mobile). Defaults to true. */
  hideLabelOnMobile?: boolean
  /** Optional label override. Defaults to "Export". */
  label?: string
}

function sanitizeSheetName(name: string): string {
  // Excel sheet names: max 31 chars, no : \ / ? * [ ]
  const cleaned = name.replace(/[:\\/?*[\]]/g, "").trim().slice(0, 31)
  return cleaned || "Sheet1"
}

function buildExportRow<T>(
  row: T,
  rowIndex: number,
  columns: ExportColumn<T>[]
): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const col of columns) {
    let value: string | number | null | undefined
    if (col.accessor) {
      value = col.accessor(row, rowIndex)
    } else {
      value = (row as Record<string, unknown>)?.[col.key] as
        | string
        | number
        | null
        | undefined
    }
    if (value === null || value === undefined) {
      out[col.key] = ""
    } else if (typeof value === "number") {
      out[col.key] = value
    } else {
      // Stringify objects/arrays nicely, trim booleans
      if (typeof value === "boolean") {
        out[col.key] = value ? "Yes" : "No"
      } else if (typeof value === "object") {
        try {
          out[col.key] = JSON.stringify(value)
        } catch {
          out[col.key] = String(value)
        }
      } else {
        out[col.key] = String(value)
      }
    }
  }
  return out
}

export function TableExportButton<T>({
  rows,
  columns,
  filename,
  sheetName,
  disabled,
  variant = "outline",
  size = "default",
  className,
  hideLabelOnMobile = true,
  label = "Export",
}: TableExportButtonProps<T>) {
  const [busy, setBusy] = React.useState<"xlsx" | null>(null)

  const hasData = Array.isArray(rows) && rows.length > 0
  const isDisabled = disabled || !hasData || busy !== null

  const handleExportXlsx = React.useCallback(() => {
    if (!hasData) {
      toast.error("No data to export")
      return
    }
    setBusy("xlsx")
    try {
      const data = rows.map((row, idx) => buildExportRow(row, idx, columns))
      // Build worksheet from json with custom headers
      const ws = XLSX.utils.json_to_sheet(data, {
        header: columns.map((c) => c.key),
      })
      // Replace header row with friendly headers
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c })
        if (ws[cellRef]) {
          ws[cellRef].v = columns[c]?.header ?? columns[c]?.key
        }
      }
      // Auto column widths
      const colWidths = columns.map((col) => {
        let maxLen = col.header.length
        data.forEach((d) => {
          const v = d[col.key]
          const len = v == null ? 0 : String(v).length
          if (len > maxLen) maxLen = len
        })
        return { wch: Math.min(Math.max(maxLen + 2, 10), 60) }
      })
      ws["!cols"] = colWidths

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheetName ?? filename))
      const stamp = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `${filename}_${stamp}.xlsx`)
      toast.success(`Exported ${data.length} row${data.length === 1 ? "" : "s"} to Excel`)
    } catch (err) {
      console.error("Export xlsx error:", err)
      toast.error("Failed to export Excel file")
    } finally {
      setBusy(null)
    }
  }, [rows, columns, filename, sheetName, hasData])



  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleExportXlsx}
      className={cn(
        "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
        className,
      )}
      title={hasData ? `Export ${rows.length} row${rows.length === 1 ? "" : "s"}` : "No data to export"}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {hideLabelOnMobile ? (
        <span className="hidden sm:inline ml-2">{label}</span>
      ) : (
        <span className="ml-2">{label}</span>
      )}
    </Button>
  )
}

export default TableExportButton
