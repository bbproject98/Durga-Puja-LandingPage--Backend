-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "context" TEXT,
    "action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fleet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "models" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "luggage" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL DEFAULT 'gold',
    "image" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "baseHours" INTEGER NOT NULL,
    "baseKm" INTEGER NOT NULL,
    "nightPrice" INTEGER NOT NULL,
    "perExtraHour" INTEGER NOT NULL,
    "outstationPerKm" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "inclusions" TEXT NOT NULL,
    "exclusions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "hoursKm" TEXT,
    "rentalType" TEXT,
    "distance" TEXT,
    "estimatedTime" TEXT,
    "priceStarting" INTEGER NOT NULL DEFAULT 2499,
    "badge" TEXT NOT NULL,
    "optimalTime" TEXT,
    "highlights" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "vehicleModels" TEXT NOT NULL,
    "vehicleSeats" INTEGER NOT NULL,
    "packageTitle" TEXT NOT NULL,
    "travelDate" TEXT NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "returnDate" TEXT,
    "returnTime" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupPincode" TEXT,
    "pickupState" TEXT,
    "advancePaid" INTEGER NOT NULL,
    "totalTariff" INTEGER NOT NULL,
    "balancePayable" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "cashfreeOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingId_key" ON "Booking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_cashfreeOrderId_key" ON "Booking"("cashfreeOrderId");
