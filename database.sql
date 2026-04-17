-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: vyra_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (5,2,31,1);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,3499.00),(2,1,7,1,2499.00),(3,2,9,1,2899.00),(4,2,23,1,3199.00),(5,3,10,1,2999.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,5998.00,NULL,'processing','2026-04-16 19:00:30'),(2,2,6098.00,NULL,'processing','2026-04-17 03:43:45'),(3,1,2999.00,NULL,'processing','2026-04-17 06:39:22');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `notes` text,
  `stock` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` enum('Male','Female','Unisex') DEFAULT 'Unisex',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Cedar Noir',3499.00,'Woody','Cedarwood, Sandalwood, Vetiver',49,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(2,'Midnight Ember',3899.00,'Woody','Smoked Sandalwood, Tobacco, Amber',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(3,'Timber Reserve',4299.00,'Woody','Aged Oak, Pine Needles, Musk',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(4,'Royal Vetiver',3199.00,'Woody','Haitian Vetiver, Cypress, Moss',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(5,'Bergamot Breeze',2799.00,'Citrus','Lemon, Bergamot, Vetiver',50,'/uploads/citrus.png','2026-04-16 17:14:14','Male'),(6,'Sicilian Mandarin',2999.00,'Citrus','Mandarin Orange, Basil, Amber',50,'/uploads/citrus.png','2026-04-16 17:14:14','Male'),(7,'Lemon Zest Supreme',2499.00,'Citrus','Amalfi Lemon, Rosemary, Musk',49,'/uploads/citrus.png','2026-04-16 17:14:14','Male'),(8,'Grapefruit Oasis',2899.00,'Citrus','Pink Grapefruit, Ginger, Cedar',50,'/uploads/citrus.png','2026-04-16 17:14:14','Male'),(9,'Oceanic Depths',2899.00,'Aquatic','Sea Salt, Marine Accord, Driftwood',49,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(10,'Deep Blue Torrent',2999.00,'Aquatic','Oceanic Notes, Mint, Cedar',49,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(11,'Sea Breeze Horizon',2699.00,'Aquatic','Melon, Seaweed, Ambergris',50,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(12,'Pacific Wave',3199.00,'Aquatic','Water Notes, Lavender, Musk',50,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(13,'Tuscan Hide',4999.00,'Leather','Suede, Raspberry, Thyme',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(14,'Smoked Saffron',5299.00,'Leather','Black Leather, Saffron, Oud',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(15,'Imperial Saddle',4799.00,'Leather','Aged Leather, Birch Tar, Musk',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(16,'Oud & Leather',5599.00,'Leather','Dark Oud, Leather Accord, Cardamom',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Male'),(17,'Black Pepper Reserve',3499.00,'Spicy','Black Pepper, Nutmeg, Cedar',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Male'),(18,'Cardamom Flame',3899.00,'Spicy','Cardamom, Cinnamon, Vanilla',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Male'),(19,'Ginger Wood',3299.00,'Spicy','Fresh Ginger, Coriander, Sandalwood',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Male'),(20,'Nutmeg & Amber',3699.00,'Spicy','Nutmeg, Amber, Patchouli',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Male'),(21,'Oakmoss Classic',2999.00,'Fougere','Oakmoss, Lavender, Coumarin',50,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(22,'Lavender Fern',2799.00,'Fougere','French Lavender, Geranium, Vetiver',50,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(23,'Green Canopy',3199.00,'Fougere','Mint, Basil, Pine',49,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(24,'Forest Mist',3499.00,'Fougere','Clary Sage, Juniper, Cedar',50,'/uploads/aquatic.jpg','2026-04-16 17:14:14','Male'),(25,'Blooming Desire',2999.00,'Floral','Rose, Jasmine, Peony, Musk',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(26,'Velvet Rose',3299.00,'Floral','Damask Rose, White Musk, Lychee',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(27,'Peony Blossom',2899.00,'Floral','Pink Peony, Freesia, Sandalwood',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(28,'Jasmine Radiance',3599.00,'Floral','Sambac Jasmine, Tuberose, Honey',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(29,'Amber Whisper',3899.00,'Oriental','Amber, Jasmine, Saffron',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Female'),(30,'Midnight Saffron',3999.00,'Oriental','Saffron, Vanilla, Oud',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Female'),(31,'Mystic Oud',5599.00,'Oriental','Rose, Oud, Praline, Clove',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Female'),(32,'Velvet Cardamom',4199.00,'Oriental','Cardamom, Cinnamon, Sandalwood',50,'/uploads/oreintal.png','2026-04-16 17:14:14','Female'),(33,'Vanilla Silk',3499.00,'Gourmand','Madagascar Vanilla, Tonka Bean, Caramel',50,'/uploads/gourmand.jpg','2026-04-16 17:14:14','Female'),(34,'Caramel Velvet',3299.00,'Gourmand','Caramel, Vanilla, Sea Salt',50,'/uploads/gourmand.jpg','2026-04-16 17:14:14','Female'),(35,'Praline Dream',3699.00,'Gourmand','Praline, Hazelnut, Milk Chocolate',50,'/uploads/gourmand.jpg','2026-04-16 17:14:14','Female'),(36,'Almond Macaron',3899.00,'Gourmand','Sweet Almond, Powder, Vanilla',50,'/uploads/gourmand.jpg','2026-04-16 17:14:14','Female'),(37,'Peach Nectar',2699.00,'Fruity','White Peach, Nectarine, Musk',50,'/uploads/citrus.png','2026-04-16 17:14:14','Female'),(38,'Berry Bliss',2899.00,'Fruity','Blackberry, Raspberry, Vanilla',50,'/uploads/citrus.png','2026-04-16 17:14:14','Female'),(39,'Apple Blossom',2499.00,'Fruity','Crisp Apple, Freesia, Cedar',50,'/uploads/citrus.png','2026-04-16 17:14:14','Female'),(40,'Plum Velvet',3199.00,'Fruity','Dark Plum, Rose, Amber',50,'/uploads/citrus.png','2026-04-16 17:14:14','Female'),(41,'Iris Mist',3499.00,'Powdery','Iris Root, Violet, White Musk',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(42,'Violet Dream',3299.00,'Powdery','Violet Leaf, Heliotrope, Vanilla',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(43,'Cotton Silk',2899.00,'Powdery','Aldehydes, White Rose, Musk',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(44,'Cashmere Cloud',3699.00,'Powdery','Cashmeran, Orris, Sandalwood',50,'/uploads/floral.png','2026-04-16 17:14:14','Female'),(45,'Patchouli Elegance',3899.00,'Chypre','Patchouli, Bergamot, Rose',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Female'),(46,'Mossy Rose',3599.00,'Chypre','Oakmoss, Damask Rose, Labdanum',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Female'),(47,'Bergamot Bloom',3199.00,'Chypre','Bergamot, Ylang-Ylang, Vetiver',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Female'),(48,'Earthy Chypre',4299.00,'Chypre','Galbanum, Jasmine, Oakmoss',50,'/uploads/woody.jpg','2026-04-16 17:14:14','Female');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(15) DEFAULT NULL,
  `address` text,
  `city` varchar(50) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Aaryan Patil','aaryan@gmail.com','$2b$10$ax1AinzCgY.5yjf81mMhpu0NEVknGBNkVifhvOwVVd8izPH0deCf6',NULL,'customer','2026-04-16 17:43:50','9359563849','','',''),(2,'Admin','admin@vyra.linkpc.net','$2b$10$qanQVK8O4T8IP3Zuhhxx5uxRnyou.yTVRLbG33.89EIrsIkrbaG9e',NULL,'admin','2026-04-16 19:11:29',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 13:44:01
