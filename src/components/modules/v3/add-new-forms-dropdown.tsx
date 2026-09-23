'use client'

import React, { useState } from 'react'
import { Plus, ChevronDown, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import RoadSafetyFormDialog from '../road-safety-form-dialog'
import EVMFormDialog from '../evm-form-dialog'
import SocialSafeguardFormDialog from '../social-safeguard-form-dialog'
import SkillTrainingFormDialog from '../skill-training-form-dialog'
import LabourLawFormDialog from '../labour-law-form-dialog'
import GenderFormDialog from '../gender-form-dialog'
import OHSFormDialog from '../ohs-form-dialog'

export function AddNewFormsDropdown() {
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [socialHovered, setSocialHovered] = useState(false)
  
  const [ohsOpen, setOhsOpen] = useState(false)
  const [evmOpen, setEvmOpen] = useState(false)
  const [rsOpen, setRsOpen] = useState(false)
  const [ssOpen, setSsOpen] = useState(false)
  const [stOpen, setStOpen] = useState(false)
  const [llOpen, setLlOpen] = useState(false)
  const [genOpen, setGenOpen] = useState(false)

  const queryClient = useQueryClient()

  // Helpers to invalidate queries when a form is saved
  const refreshOHS = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'OHS'] })
  const refreshEVM = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'EVM'] })
  const refreshRS = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'Road Safety'] })
  const refreshSS = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'Social'] })
  const refreshST = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'Skill Training'] })
  const refreshLL = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'Labour Law'] })
  const refreshGen = () => queryClient.invalidateQueries({ queryKey: ['es-forms', 'Gender'] })

  return (
    <>
      <DropdownMenu open={addMenuOpen} onOpenChange={(open) => {
        setAddMenuOpen(open)
        if (!open) setSocialHovered(false)
      }}>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="bg-[#0d9488] hover:bg-[#0f766e] text-white gap-1.5 h-9 text-xs font-semibold shadow-sm px-3">
            <Plus className="h-4 w-4" />
            Add New Form
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 sm:w-80 p-1.5 shadow-xl border-slate-200 dark:border-slate-800 z-50">
          {/* OHS */}
          <DropdownMenuItem
            onClick={() => { setOhsOpen(true); setAddMenuOpen(false) }}
            onMouseEnter={() => setSocialHovered(false)}
            className="cursor-pointer gap-2.5 py-2 font-medium"
          >
            <FileText className="h-4 w-4 text-[#0d9488]" />
            OHS Monitoring
          </DropdownMenuItem>

          {/* EVM */}
          <DropdownMenuItem
            onClick={() => { setEvmOpen(true); setAddMenuOpen(false) }}
            onMouseEnter={() => setSocialHovered(false)}
            className="cursor-pointer gap-2.5 py-2 font-medium"
          >
            <FileText className="h-4 w-4 text-[#0d9488]" />
            EVM — Environmental Monitoring
          </DropdownMenuItem>

          {/* Road Safety */}
          <DropdownMenuItem
            onClick={() => { setRsOpen(true); setAddMenuOpen(false) }}
            onMouseEnter={() => setSocialHovered(false)}
            className="cursor-pointer gap-2.5 py-2 font-medium"
          >
            <FileText className="h-4 w-4 text-[#0d9488]" />
            Road Safety Checklist
          </DropdownMenuItem>

          {/* Social */}
          <div
            className="flex flex-col"
            onMouseEnter={() => setSocialHovered(true)}
            onMouseLeave={() => setSocialHovered(false)}
          >
            <div
              onClick={() => setSocialHovered(prev => !prev)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2.5 rounded-sm px-2 py-2 text-sm select-none transition-colors font-medium",
                socialHovered ? "bg-[#0d9488]/10 text-[#0d9488]" : "hover:bg-accent hover:text-accent-foreground text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-[#0d9488]" />
                <span>Social Compliance (4 Sub-Forms)</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  socialHovered && "rotate-180 text-[#0d9488]"
                )}
              />
            </div>

            {socialHovered && (
              <div className="mt-1 flex flex-col gap-0.5 pl-2 py-1.5 border-l-2 border-[#0d9488] ml-4 bg-muted/40 rounded-r-md animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <DropdownMenuItem
                  onClick={() => {
                    setSsOpen(true)
                    setAddMenuOpen(false)
                    setSocialHovered(false)
                  }}
                  className="cursor-pointer text-xs py-1.5 px-2 gap-2 text-foreground hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded font-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0" />
                  Social Safeguard Compliance for MPR
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setStOpen(true)
                    setAddMenuOpen(false)
                    setSocialHovered(false)
                  }}
                  className="cursor-pointer text-xs py-1.5 px-2 gap-2 text-foreground hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded font-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0" />
                  Skill Training & Employment
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setLlOpen(true)
                    setAddMenuOpen(false)
                    setSocialHovered(false)
                  }}
                  className="cursor-pointer text-xs py-1.5 px-2 gap-2 text-foreground hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded font-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0" />
                  Labour Law Compliance
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setGenOpen(true)
                    setAddMenuOpen(false)
                    setSocialHovered(false)
                  }}
                  className="cursor-pointer text-xs py-1.5 px-2 gap-2 text-foreground hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded font-normal"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0" />
                  Gender
                </DropdownMenuItem>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render the dialogs conditionally at the top level */}
      {ohsOpen && <OHSFormDialog open={ohsOpen} onOpenChange={setOhsOpen} onSaved={refreshOHS} />}
      {rsOpen && <RoadSafetyFormDialog open={rsOpen} onOpenChange={setRsOpen} onSaved={refreshRS} />}
      {evmOpen && <EVMFormDialog open={evmOpen} onOpenChange={setEvmOpen} onSaved={refreshEVM} />}
      {ssOpen && <SocialSafeguardFormDialog open={ssOpen} onOpenChange={setSsOpen} onSaved={refreshSS} />}
      {stOpen && <SkillTrainingFormDialog open={stOpen} onOpenChange={setStOpen} onSaved={refreshST} />}
      {llOpen && <LabourLawFormDialog open={llOpen} onOpenChange={setLlOpen} onSaved={refreshLL} />}
      {genOpen && <GenderFormDialog open={genOpen} onOpenChange={setGenOpen} onSaved={refreshGen} />}
    </>
  )
}
