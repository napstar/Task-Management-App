using DocumentFormat.OpenXml.Wordprocessing;

public static class TableHelper
{
    public static void AddRowToTable(Table table, string text)
    {
        var tr = new TableRow();
        var tc = new TableCell();
        
        // Add text to the cell
        tc.Append(new Paragraph(new Run(new Text(text))));
        
        // Add borders/width properties if needed (simplified here)
        tc.Append(new TableCellProperties(
            new TableCellWidth { Type = TableWidthUnitValues.Auto }));

        tr.Append(tc);
        table.Append(tr);
    }

    public static void ClearDataRows(Table table)
    {
        // Skip the header row (index 0) and remove the rest
        var rows = table.Elements<TableRow>().Skip(1).ToList();
        foreach (var row in rows)
        {
            row.Remove();
        }
    }
}