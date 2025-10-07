CREATE OR REPLACE FUNCTION updatedAt()
RETURNS TRIGGER AS $function$
BEGIN
    NEW."updatedAt" := (NOW() AT TIME ZONE 'UTC');
    RETURN NEW;
END;
$function$ LANGUAGE plpgsql;

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    active BOOLEAN DEFAULT TRUE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(20,3) NOT NULL,
    stock INT NOT NULL DEFAULT 0
);

CREATE TRIGGER updatedProduct
BEFORE UPDATE ON product
FOR EACH ROW
EXECUTE FUNCTION updatedAt();

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    active BOOLEAN DEFAULT TRUE,
    "fullName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "cellPhone" VARCHAR(255)
);

CREATE TRIGGER updatedCustomer
BEFORE UPDATE ON customer
FOR EACH ROW
EXECUTE FUNCTION updatedAt();

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS "order" (
    id UUID PRIMARY KEY,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    active BOOLEAN DEFAULT TRUE,
    productId UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    customerId UUID REFERENCES customer(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    total NUMERIC(20,3) NOT NULL
);

CREATE TRIGGER updatedOrder
BEFORE UPDATE ON "order"
FOR EACH ROW
EXECUTE FUNCTION updatedAt();

-- Tabela de histórico
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    "entityId" UUID NOT NULL,
    "userToken" TEXT,
    ip VARCHAR(45),
    port INT,
    method VARCHAR(10),
    path TEXT
);

CREATE TRIGGER updatedHistory
BEFORE UPDATE ON history
FOR EACH ROW
EXECUTE FUNCTION updatedAt();

-- DROP TABLE IF EXISTS history CASCADE;
-- DROP TABLE IF EXISTS "order" CASCADE;
-- DROP TABLE IF EXISTS customer CASCADE;
-- DROP TABLE IF EXISTS product CASCADE;