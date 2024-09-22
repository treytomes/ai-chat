import { SortDescriptor } from "@nextui-org/react";

export function sortList<T extends Object>(
  list: T[],
  sortDescriptor: SortDescriptor
) {
  return list.sort((a, b) => {
    let first = Reflect.get(a, sortDescriptor.column as PropertyKey) as string;
    let second = Reflect.get(b, sortDescriptor.column as PropertyKey) as string;

    let cmp =
      (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1;

    if (sortDescriptor.direction === "descending") {
      cmp *= -1;
    }

    return cmp;
  });
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
