"use client"

import { useEffect } from "react"

export default function ViewportHandler() {
  useEffect(() => {
    // Function to update CSS variables with the actual viewport height
    const updateHeight = () => {
      // First we get the viewport height and multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty("--vh", `${vh}px`)
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`)
    }

    // Add event listener for resize and orientation change
    window.addEventListener("resize", updateHeight)
    window.addEventListener("orientationchange", updateHeight)

    // Initial call
    updateHeight()

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateHeight)
      window.removeEventListener("orientationchange", updateHeight)
    }
  }, [])

  // Handle iOS Safari address bar hiding
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}
