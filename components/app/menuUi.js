"use client";

import { createContext, useContext } from "react";

// Lets any piece of the menu browser change the URL (filters, tab, page...) inside one transition,
// so the old list stays on screen until the new one is ready (the skeleton appears after a short delay).
export const NavContext = createContext({ go: () => {}, pending: false });
export const useMenuNav = () => useContext(NavContext);
