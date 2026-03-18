import { useState, useEffect } from 'react';
import { Course } from '../types';

export const useCourses = (userId: string | null) => {
  const [courses, setCourses] = useState<Course[]>([]);

  // Load from local storage
  useEffect(() => {
    if (!userId) {
      setCourses([]);
      return;
    }
    const stored = localStorage.getItem(`lectureManager_courses_${userId}`);
    if (stored) {
      try {
        setCourses(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse courses', e);
      }
    }
  }, [userId]);

  // Save to local storage
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`lectureManager_courses_${userId}`, JSON.stringify(courses));
    }
  }, [courses, userId]);

  const addCourse = (course: Omit<Course, 'id' | 'createdAt' | 'userId'>) => {
    if (!userId) return;
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString()
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  return { courses, addCourse, deleteCourse };
};
