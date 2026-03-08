import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface AccountItem {
  id: number;
  name: string;
}

interface AccountSelectorProps {
  accountItems: AccountItem[];
  selectedId: number | null;
  onSelect: (id: number, name: string) => void;
  placeholder?: string;
}

export default function AccountSelector({
  accountItems,
  selectedId,
  onSelect,
  placeholder = "勘定科目を選択",
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedItem = accountItems.find((item) => item.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItem ? selectedItem.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="勘定科目を検索..." />
          <CommandList>
            <CommandEmpty>該当する科目が見つかりません</CommandEmpty>
            <CommandGroup>
              {accountItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onSelect(item.id, item.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
