import { useRef, useEffect, useState } from 'react'
import { useInView, useScroll, useTransform } from 'framer-motion'

export const useScrollAnimations = () => {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const statsRef = useRef(null)
  const testimonialsRef = useRef(null)
  
  const { scrollY } = useScroll()
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])
  
  // Intersection observers with optimized thresholds
  const heroInView = useInView(heroRef, { 
    once: true, 
    margin: "-100px",
    amount: 0.3
  })
  const featuresInView = useInView(featuresRef, { 
    once: true, 
    margin: "-50px",
    amount: 0.2
  })
  const statsInView = useInView(statsRef, { 
    once: true, 
    margin: "-50px",
    amount: 0.3
  })
  const testimonialsInView = useInView(testimonialsRef, { 
    once: true, 
    margin: "-50px",
    amount: 0.2
  })

  return {
    refs: {
      heroRef,
      featuresRef,
      statsRef,
      testimonialsRef
    },
    parallax: {
      heroY,
      heroOpacity
    },
    inView: {
      heroInView,
      featuresInView,
      statsInView,
      testimonialsInView
    }
  }
}

export const useAnimatedCounter = (endValue, duration = 2000, isActive = false) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!isActive) return
    
    const steps = 60
    const stepDuration = duration / steps
    const increment = endValue / steps
    
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= endValue) {
        current = endValue
        clearInterval(timer)
      }
      setCount(Math.floor(current))
    }, stepDuration)
    
    return () => clearInterval(timer)
  }, [endValue, duration, isActive])
  
  return count
}

export const useTestimonialRotation = (testimonials, interval = 4000) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, interval)
    
    return () => clearInterval(timer)
  }, [testimonials.length, interval])
  
  return {
    currentIndex,
    setCurrentIndex,
    currentTestimonial: testimonials[currentIndex]
  }
}
