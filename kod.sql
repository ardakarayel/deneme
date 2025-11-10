USE onlinestore;

SELECT 
  CONCAT(LEFT(id, 7), '..') AS id,
  CONCAT(LEFT(name, 25), '..') AS name,
  category,
  subcategory,
  price,
  stock,
  CONCAT(LEFT(imageUrl, 25), '..') AS imageUrl,
  CONCAT(LEFT(description, 25), '..') AS description
FROM product;
