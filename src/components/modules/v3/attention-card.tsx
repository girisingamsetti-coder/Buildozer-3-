import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldAlert, CheckCircle2, Filter } from 'lucide-react'
import { AttentionItem } from './v3-types'

export function AttentionCard({ attentionItems, month, domain }: { attentionItems: AttentionItem[], month: string, domain?: string }) {
  const [ruleFilter, setRuleFilter] = useState<string>('ALL')

  const domainItems = useMemo(() => {
    if (!domain || domain === 'ALL') return attentionItems
    return attentionItems.filter(i => i.domain.toLowerCase().includes(domain.toLowerCase()))
  }, [attentionItems, domain])

  const filteredAttentionItems = useMemo(() => {
    if (ruleFilter === 'ALL') return domainItems
    return domainItems.filter((item) => item.rule?.toLowerCase().includes(ruleFilter.toLowerCase()))
  }, [domainItems, ruleFilter])

  return (
    <Card className="border shadow-xs flex flex-col rounded-2xl shadow-sm border-border/40 min-h-[300px]">
      <CardHeader className="p-4 border-b bg-muted/20 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Attention Required ({filteredAttentionItems.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated 9-Rule Global Exception Engine
            </p>
          </div>
          <Badge variant="destructive" className="text-[10px] px-2">
            Action Needed
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
          <Select value={ruleFilter} onValueChange={setRuleFilter}>
            <SelectTrigger className="h-7 text-[11px] bg-card border-border/80">
              <SelectValue placeholder="Filter by Exception Rule" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL">All 9 Exception Rules</SelectItem>
              <SelectItem value="Rule 1">Rule 1: Missing Form</SelectItem>
              <SelectItem value="Rule 2">Rule 2: Non-Compliant Item</SelectItem>
              <SelectItem value="Rule 3">Rule 3: Missing Evidence</SelectItem>
              <SelectItem value="Rule 4">Rule 4: Air Exceedance</SelectItem>
              <SelectItem value="Rule 5">Rule 5: Pending Observations</SelectItem>
              <SelectItem value="Rule 6">Rule 6: GRC Pending</SelectItem>
              <SelectItem value="Rule 7">Rule 7: SEA/SH Pending</SelectItem>
              <SelectItem value="Rule 8">Rule 8: Child Labour Risk</SelectItem>
              <SelectItem value="Rule 9">Rule 9: Expired License</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-1 overflow-y-auto max-h-[460px] divide-y divide-border/60">
        {filteredAttentionItems.length > 0 ? (
          filteredAttentionItems.map((item) => (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground truncate">{item.projectName}</span>
                <Badge
                  className={`text-[9px] px-1.5 py-0 font-mono shrink-0 ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  }`}
                >
                  {item.rule || item.domain}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {item.issue}
              </p>
              <div className="text-[11px] text-primary font-medium flex items-center justify-between gap-1 mt-0.5">
                <span className="truncate">Action: {item.action}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{item.contractor}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 text-center text-muted-foreground text-xs my-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No exceptions flagged under this filter for {month}.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
