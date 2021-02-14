/** @hidden  */
const extractLinkedText = (node: HTMLElement): string => {
  const tmpNode = node.cloneNode(true) as HTMLElement;
  Array.from(tmpNode.querySelectorAll("a")).forEach(
    el => (el.innerText = `[${el.innerText}](el.href)`)
  );
  return tmpNode.innerText.trim();
};

/**
 * @category high-level
 */
export function extractTableData(table: HTMLTableElement) {
  let keys: string[] = [];
  if (table.tHead !== null) {
    keys = Array.from(table.tHead.querySelectorAll("th")).map(el =>
      extractLinkedText(el)
    );
  }
  return Array.from(table.tBodies).map(el =>
    Array.from(el.querySelectorAll("tr")).map(tableRow => {
      const dataCells = Array.from(tableRow.querySelectorAll("td")).map(el =>
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
