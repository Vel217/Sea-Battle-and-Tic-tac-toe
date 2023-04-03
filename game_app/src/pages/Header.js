import React from "react";
import { useLocation } from "react-router-dom";

const steps = [
  { id: "Step 1", name: "Set Nickname", href: "/" },
  {
    id: "Step 2",
    name: "Choose Game",
    href: "/choose_game",
  },
 
  { id: "Step 3", name: "Game", href: "/game" },
];

function Header() {
  let location = useLocation();
  const path = location.pathname;
  const currentIdx = steps.findIndex((step) => step.href === path);

  return (
    <div>
      <nav aria-label="Progress">
        <ol className="mb-3 md:flex md:space-y-0 md:space-x-2">
          {steps.map((step, idx) => (
            <li key={step.name} className="md:flex-1">
              {idx < currentIdx ? (
                <a
                  href={step.href}
                  className="group flex flex-col border-l-4 bg-sky-50 border-sky-600    md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                >
                  <span className="text-sm font-medium text-gray-500">
                    {step.id}
                  </span>
                  <span className="text-sm mb-5 font-medium">{step.name}</span>
                </a>
              ) : idx === currentIdx ? (
                <a
                  href={step.href}
                  className="flex flex-col border-l-4 bg-sky-200 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">
                    {step.id}
                  </span>
                  <span className="text-sm mb-5 font-medium">{step.name}</span>
                </a>
              ) : (
                <a
                  href={step.href}
                  className="group flex flex-col border-l-4 bg-gray-100 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                >
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {step.id}
                  </span>
                  <span className="text-sm mb-5 font-medium">{step.name}</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

export default Header;
