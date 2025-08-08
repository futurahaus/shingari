-- CreateTable
CREATE TABLE "public"."product_translations" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_product_id_locale_key" ON "public"."product_translations"("product_id", "locale");

-- CreateIndex
CREATE INDEX "product_translations_product_id_idx" ON "public"."product_translations"("product_id");

-- CreateIndex
CREATE INDEX "product_translations_locale_idx" ON "public"."product_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "public"."category_translations"("category_id", "locale");

-- CreateIndex
CREATE INDEX "category_translations_category_id_idx" ON "public"."category_translations"("category_id");

-- CreateIndex
CREATE INDEX "category_translations_locale_idx" ON "public"."category_translations"("locale");

-- AddForeignKey
ALTER TABLE "public"."product_translations" ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION; 