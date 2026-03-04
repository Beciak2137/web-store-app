INSERT INTO roles (id, role) VALUES 
(1, 'Admin'),
(2, 'Klient'),
(3, 'Gosc');

INSERT INTO statuses (id, status) VALUES 
(1, 'W realizacji'),
(2, 'Wysłane'),
(3, 'Anulowane'),
(4, 'W koszyku');

INSERT INTO categories (id, category) VALUES 
(1, 'Owoce'),
(2, 'Warzywa'),
(3, 'Alkohole'),
(4, 'Nabiał i pieczywo'),
(5, 'Inne'),
(6, 'Chemia');

INSERT INTO products (id, name, category_id, description, price, image_url) VALUES 
(1, 'Jabłko Ligol', 1, 'Chrupiące, słodko-kwaśne jabłko polskie.', 3.50, 'jablko.jpg'),
(2, 'Banan Bio', 1, 'Ekologiczne banany z Ekwadoru.', 6.99, 'banan.jpg'),
(3, 'Pomidor Malinowy', 2, 'Słodki i mięsisty pomidor prosto z krzaka.', 12.00, 'pomidor.jpg'),
(4, 'Ziemniaki Młode', 2, 'Ziemniaki polskie, idealne do obiadu.', 2.50, 'ziemniaki.jpg'),
(5, 'Miód Lipowy', 5, 'Naturalny miód z lokalnej pasieki.', 35.00, 'miod.jpg');