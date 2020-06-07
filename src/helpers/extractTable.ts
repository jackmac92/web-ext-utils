/** @hidden  */
const arr = Array.from;

/** @hidden  */
const extractLinkedText = (node: HTMLElement): string => {
  const tmpNode = node.cloneNode(true) as HTMLElement;
  arr(tmpNode.querySelectorAll("a")).forEach(
    el => (el.innerText = `[${el.innerText}](el.href)`)
  );
  return tmpNode.innerText.trim();
};

export function extractTableData(table: HTMLTableElement) {
  let keys: string[] = [];
  if (table.tHead !== null) {
    keys = arr(table.tHead.querySelectorAll("th")).map(el =>
      extractLinkedText(el)
    );
  }
  return arr(table.tBodies).map(el =>
    arr(el.querySelectorAll("tr")).map(tableRow => {
      const dataCells = arr(tableRow.querySelectorAll("td")).map(el =>
        extractLinkedText(el)
      );
      if (dataCells.length !== keys.length) {
        console.warn("Found a row with a mismatch");
      }
      if (keys.length === 0) {
        return dataCells;
      }
      return keys.reduce(
        (tableRow, dataKey, idx) => ({
          ...tableRow,
          [dataKey]: dataCells[idx]
        }),
        {}
      );
    })
  );
}
