"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UploadButtonProps {
  onFileUpload: (content: string) => void
  selectedLanguage: string
}

// Map file extensions to languages
const FILE_EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp'
}

export function UploadButton({ onFileUpload, selectedLanguage }: UploadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const getFileExtension = (filename: string): string => {
    return filename.slice(filename.lastIndexOf('.'))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExtension = getFileExtension(file.name)
    const fileLanguage = FILE_EXTENSION_TO_LANGUAGE[fileExtension]

    if (fileLanguage && fileLanguage !== selectedLanguage) {
      toast({
        title: "Language Mismatch",
        description: `The uploaded file (${file.name}) appears to be ${fileLanguage} code, but the selected language is ${selectedLanguage}.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string
      onFileUpload(content)
      setIsLoading(false)
    }

    reader.onerror = () => {
      console.error("Error reading file")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      })
    }

    reader.readAsText(file)

    // Reset the input value so the same file can be uploaded again
    e.target.value = ""
  }

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".js,.ts,.py,.java,.c,.cpp,.h,.hpp"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" className="cursor-pointer" disabled={isLoading} asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? "Uploading..." : "Upload File"}
          </span>
        </Button>
      </label>
    </div>
  )
}
