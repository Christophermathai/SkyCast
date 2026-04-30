"use client";

import {
  ReactNode,
  ElementType,
  useEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
  createElement,
} from "react";

/* ------------------------------------------------------------------ */
/*  AnimatedList                                                       */
/*  Lightweight staggered-reveal list powered by IntersectionObserver  */
/*  + CSS transitions. No Framer Motion dependency.                   */
/* ------------------------------------------------------------------ */

type AnimatedListProps = {
  children: ReactNode;
  className?: string;
  /** ms between each child's entrance */
  delay?: number;
  /** ms before the first child starts */
  initialDelay?: number;
  /** wrapper element – "div", "ul", "tbody", etc. */
  as?: ElementType;
};

export function AnimatedList({
  children,
  className,
  delay = 100,
  initialDelay = 0,
  as: Component = "div",
}: AnimatedListProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Inject stagger index + visible flag into each AnimatedListItem child
  const items = Children.toArray(children);

  return createElement(
    Component,
    { ref: containerRef, className },
    items.map((child, i) => {
      if (isValidElement(child)) {
        return cloneElement(child as React.ReactElement<any>, {
          _staggerIndex: i,
          _staggerDelay: delay,
          _initialDelay: initialDelay,
          _visible: visible,
        });
      }
      return child;
    })
  );
}

/* ------------------------------------------------------------------ */
/*  AnimatedListItem                                                   */
/* ------------------------------------------------------------------ */

type AnimatedListItemProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  // Internal props injected by AnimatedList
  _staggerIndex?: number;
  _staggerDelay?: number;
  _initialDelay?: number;
  _visible?: boolean;
  [key: string]: any; // pass-through (key, etc.)
};

export function AnimatedListItem({
  children,
  as: Component = "div",
  className = "",
  _staggerIndex = 0,
  _staggerDelay = 100,
  _initialDelay = 0,
  _visible = false,
  ...rest
}: AnimatedListItemProps) {
  const itemDelay = _initialDelay + _staggerIndex * _staggerDelay;

  return createElement(
    Component,
    {
      className: `animated-list-item ${_visible ? "animated-list-item--visible" : ""} ${className}`,
      style: { transitionDelay: `${itemDelay}ms` } as React.CSSProperties,
      ...rest,
    },
    children
  );
}
