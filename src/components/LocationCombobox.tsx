"use client";

import { useId, useMemo, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";

type LocationGroup = {
  value: string;
  label: string;
  cities: { value: string; label: string }[];
};

export default function LocationCombobox({
  name,
  selectedValue,
  groups,
  onFilterChanged,
}: {
  name: string;
  selectedValue: string;
  groups: LocationGroup[];
  onFilterChanged: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const getDisplayLabel = (value: string) => {
    if (value === "all") {
      return "Всички";
    }

    for (const g of groups) {
      if (g.value === value) {
        return g.label;
      }

      const city = g.cities.find((c) => c.value === value);

      if (city) {
        return city.label;
      }
    }

    return "Всички";
  };

  const filteredGroups = useMemo(() => {
    if (!query) {
      return groups;
    }

    const q = query.toLowerCase();

    return groups
      .map((g) => ({
        ...g,
        cities: g.cities.filter((c) => c.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.cities.length > 0 || g.label.toLowerCase().includes(q));
  }, [groups, query]);

  const inputId = useId();

  return (
    <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 w-52">
      <label htmlFor={inputId} className="shrink-0">{name}:</label>
      <Combobox
        value={selectedValue}
        onValueChange={(value) => {
          onFilterChanged(value ?? "all");
          setQuery("");
        }}
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setQuery("");
        }}
        inputValue={open ? query : getDisplayLabel(selectedValue)}
        onInputValueChange={(val) => {
          if (open) setQuery(val);
        }}
        filter={null}
      >
        <ComboboxInput id={inputId} placeholder="Търсене..." className="w-52" />
        <ComboboxContent>
          <ComboboxList>
            {!query && (
              <>
                <ComboboxItem
                  value="all"
                  className="px-4 py-2 text-sm font-medium text-gray-900"
                >
                  Всички
                </ComboboxItem>
                <ComboboxSeparator />
              </>
            )}
            <ComboboxEmpty>Няма намерени резултати.</ComboboxEmpty>
            {filteredGroups.map((group) => (
              <ComboboxGroup key={group.value}>
                <ComboboxItem
                  value={group.value}
                  className="px-4 py-2 text-sm font-medium text-gray-900"
                >
                  {group.label}
                </ComboboxItem>
                {group.cities
                  .filter((city) => city.value !== group.value)
                  .map((city) => (
                    <ComboboxItem
                      key={city.value}
                      value={city.value}
                      className="px-4 pl-6 text-sm font-medium text-gray-900"
                    >
                      {city.label}
                    </ComboboxItem>
                  ))}
              </ComboboxGroup>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
