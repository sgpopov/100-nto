import { ChevronDownIcon } from "@heroicons/react/16/solid";

type SelectParams = {
  id: string;
  label: string;
  defaultValue: string;
  options: { id: string; value: string; text: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const SelectFilter = (params: SelectParams) => {
  return (
    <>
      <label
        htmlFor="location"
        className="text-base font-semibold text-gray-900"
      >
        {params.label}
      </label>
      <div className="mt-2 grid grid-cols-1">
        <select
          id={params.id}
          name={params.id}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          value={params.defaultValue}
          onChange={params.onChange}
        >
          <option value="all">Всички</option>
          {params.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
        />
      </div>
    </>
  );
};
