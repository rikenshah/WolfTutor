import xlsxwriter



def writeToExcel(title, histogram, num):
    """
    write values in table form to create graph
    title: string to name file
    histogram: values to plot
    num: number of data points used in histogram
    """

    print("Creating " + title + ".xlsx...")

    #create new excel workbook and worksheet
    workbook = xlsxwriter.Workbook(title + '.xlsx')
    worksheet = workbook.add_worksheet()

    
    #set worksheet to start in A1 cell
    row = 0
    col = 0
    worksheet.write(row, col, "Bins:")
    col += 1
    worksheet.write(row, col, len(histogram)-1)
    col = 0
    row += 1
    worksheet.write(row, col, "Num Tutors:")
    col += 1
    worksheet.write(row, col, num)
    col = 0
    row += 2

    #write data
    bins = len(histogram)
    for x in range(bins):
        try: 
            worksheet.write(row, col, x)
            col += 1
            worksheet.write(row, col, histogram[x])
            col = 0
            row += 1

        except:
            print("Error at bucket", x)

    workbook.close()

    print ("Done")