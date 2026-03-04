-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2025-12-15 12:04:31.43

-- tables
-- Table: categories
CREATE DATABASE IF NOT EXISTS Sklepik;
USE Sklepik;
CREATE TABLE categories (
    id int  NOT NULL AUTO_INCREMENT,
    category varchar(50)  NOT NULL,
    CONSTRAINT categories_pk PRIMARY KEY (id)
);

-- Table: order_items
CREATE TABLE order_items (
    id int  NOT NULL AUTO_INCREMENT,
    product_id int  NOT NULL,
    order_id int  NOT NULL,
    quantity decimal(10,2)  NOT NULL,
    unit_price decimal(10,2)  NOT NULL,
    CONSTRAINT order_items_pk PRIMARY KEY (id)
);

-- Table: orders
CREATE TABLE orders (
    id int  NOT NULL AUTO_INCREMENT,
    user_id int  NOT NULL,
    status_id int  NOT NULL,
    total_price decimal(10,2)  NOT NULL,
    order_date datetime  NOT NULL,
    address varchar(255)  NOT NULL,
    CONSTRAINT orders_pk PRIMARY KEY (id)
);

-- Table: products
CREATE TABLE products (
    id int  NOT NULL AUTO_INCREMENT,
    name varchar(100)  NOT NULL,
    category_id int  NOT NULL,
    description text  NOT NULL,
    price decimal(10,2)  NOT NULL,
    image_url varchar(255)  NOT NULL,
    CONSTRAINT products_pk PRIMARY KEY (id)
);

-- Table: roles
CREATE TABLE roles (
    id int  NOT NULL AUTO_INCREMENT,
    role varchar(10)  NOT NULL,
    CONSTRAINT roles_pk PRIMARY KEY (id)
);

-- Table: statuses
CREATE TABLE statuses (
    id int  NOT NULL AUTO_INCREMENT,
    status varchar(50)  NOT NULL,
    CONSTRAINT statuses_pk PRIMARY KEY (id)
);

-- Table: users
CREATE TABLE users (
    id int  NOT NULL AUTO_INCREMENT,
    email varchar(255)  NOT NULL,
    password varchar(255)  NOT NULL,
    role_id int  NOT NULL,
    full_name varchar(100)  NOT NULL,
    created_at datetime  NOT NULL,
    birth_date date  NOT NULL,
    CONSTRAINT users_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: order_items_orders (table: order_items)
ALTER TABLE order_items ADD CONSTRAINT order_items_orders FOREIGN KEY order_items_orders (order_id)
    REFERENCES orders (id);

-- Reference: order_items_products (table: order_items)
ALTER TABLE order_items ADD CONSTRAINT order_items_products FOREIGN KEY order_items_products (product_id)
    REFERENCES products (id);

-- Reference: orders_statuses (table: orders)
ALTER TABLE orders ADD CONSTRAINT orders_statuses FOREIGN KEY orders_statuses (status_id)
    REFERENCES statuses (id);

-- Reference: orders_users (table: orders)
ALTER TABLE orders ADD CONSTRAINT orders_users FOREIGN KEY orders_users (user_id)
    REFERENCES users (id);

-- Reference: products_categories (table: products)
ALTER TABLE products ADD CONSTRAINT products_categories FOREIGN KEY products_categories (category_id)
    REFERENCES categories (id);

-- Reference: users_roles (table: users)
ALTER TABLE users ADD CONSTRAINT users_roles FOREIGN KEY users_roles (role_id)
    REFERENCES roles (id);

-- End of file.

