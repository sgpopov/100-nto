"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

type FilterOption = {
  value: string;
  label: string;
};

export default function Filter({
  name,
  selectedValue,
  options,
  onFilterChanged,
}: {
  name: string;
  selectedValue: string;
  options: FilterOption[];
  onFilterChanged: (value: string) => void;
}) {
  const onOptionClicked = (option: FilterOption) => {
    onFilterChanged(option.value);
  };

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );

  const formatLabel = (value = "") => {
    return value.replace("-", "").trim();
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
          {name}: <b>&nbsp;{formatLabel(selectedOption?.label)}</b>
          <ChevronDownIcon
            aria-hidden="true"
            className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
          />
        </MenuButton>
      </div>

      <MenuItems
        anchor="bottom start"
        transition
        className="absolute left-0 z-10 mt-2 w-52 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {options.map((option) => (
            <MenuItem key={`${name}-${option.value}`}>
              <div
                onClick={() => onOptionClicked(option)}
                className="block px-4 py-2 text-sm font-medium text-gray-900 data-focus:bg-gray-100 data-focus:outline-hidden cursor-pointer"
              >
                {option.label}
              </div>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
