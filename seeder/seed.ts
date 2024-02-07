import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

const parseExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('./seeder/flightsNew.xlsx');

  const worksheet = workbook.getWorksheet(1);

  const flightsData = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values as Array<string | Date | number>;

    if (
      rowNumber !== 1 &&
      values.length >= 7 &&
      values.slice(1).every((value) => value !== undefined && value !== '')
    ) {
      const [
        flight_number,
        from,
        to,
        departure_time,
        arrival_time,
        price,
        available_tickets,
      ] = values.slice(1) as [
        string,
        string,
        string,
        Date,
        Date,
        number,
        number,
      ];

      flightsData.push({
        flight_number,
        from,
        to,
        departure_time,
        arrival_time,
        price,
        available_tickets,
      });
    }
  });

  return flightsData;
};

const seedDatabase = async () => {
  const flightsData = await parseExcel();
  let addedFlightsCount = 0;

  for (const flightData of flightsData) {
    await prisma.flight.create({
      data: {
        flight_number: flightData.flight_number,
        from: flightData.from,
        to: flightData.to,
        departure_time: new Date(flightData.departure_time),
        arrival_time: new Date(flightData.arrival_time),
        price: flightData.price,
        available_tickets: flightData.available_tickets,
      },
    });
    addedFlightsCount++;
  }

  console.log(
    `Flight table seeded successfully. Added ${addedFlightsCount} flights.`,
  );
};

seedDatabase()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



