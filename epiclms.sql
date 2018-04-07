-- MySQL dump 10.13  Distrib 5.7.21, for Win64 (x86_64)
--
-- Host: localhost    Database: epiclms
-- ------------------------------------------------------
-- Server version	5.7.21-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) DEFAULT NULL,
  `course_code` varchar(45) DEFAULT NULL,
  `course_hours` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `dept_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (1,'Database Systems','CS-204',3,4,1),(2,'Operating Systems','CS-206',3,4,1),(3,'Theory of Computing','CS-208',3,4,1),(4,'Object Oriented Analysis & Design','CS-201',3,4,1),(5,'Probability & Statistics','MT-206',3,4,1),(6,'Programming Fundamentals','CS-102',3,1,1),(7,'Some Electrical Course','EE-123',2,4,3),(8,'Digital Logic Design','EE-456',2,2,1),(9,'Entrepreneurship','MS-092',2,2,4);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_data`
--

DROP TABLE IF EXISTS `course_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `file_name` varchar(50) DEFAULT NULL,
  `date_uploaded` date DEFAULT NULL,
  `file_title` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `faculty_id` (`faculty_id`),
  CONSTRAINT `course_data_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `course_data_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_data`
--

LOCK TABLES `course_data` WRITE;
/*!40000 ALTER TABLE `course_data` DISABLE KEYS */;
INSERT INTO `course_data` VALUES (1,1,3,'ABCFILE.jpg','2018-04-07','Lecture 04');
/*!40000 ALTER TABLE `course_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `department` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,'Computer Science'),(2,'Mechanical Engineering'),(3,'Electrical Engineering'),(4,'Management Sciences');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dept_course`
--

DROP TABLE IF EXISTS `dept_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dept_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dept_id` (`dept_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `dept_course_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `department` (`department_id`),
  CONSTRAINT `dept_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dept_course`
--

LOCK TABLES `dept_course` WRITE;
/*!40000 ALTER TABLE `dept_course` DISABLE KEYS */;
/*!40000 ALTER TABLE `dept_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `faculty` (
  `faculty_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` binary(60) DEFAULT NULL,
  `dept_id` int(11) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`faculty_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES (3,'Shayan','Mustafa','shayanmustafa@gmail.com','$2a$10$TaqpL6vvC8s3BPs.cocd.O0Xx0GllE85HPOQM3SD.A1JFJ7ncUzXu',1,'pic-1522952796427.png');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_course`
--

DROP TABLE IF EXISTS `faculty_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `faculty_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `faculty_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `faculty_course_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  CONSTRAINT `faculty_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_course`
--

LOCK TABLES `faculty_course` WRITE;
/*!40000 ALTER TABLE `faculty_course` DISABLE KEYS */;
INSERT INTO `faculty_course` VALUES (8,3,1),(9,3,2);
/*!40000 ALTER TABLE `faculty_course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('9eDAFCz1iy4gDPbO_l9bYg8TReQU-ZTi',1523193681,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":{\"user_id\":3,\"user_type\":\"faculty\"}}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
  `student_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(25) DEFAULT NULL,
  `last_name` varchar(25) DEFAULT NULL,
  `email` varchar(25) DEFAULT NULL,
  `password` binary(60) DEFAULT NULL,
  `dept_id` int(2) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `semester` int(1) DEFAULT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
INSERT INTO `student` VALUES (18,'Kumail','Pirzada','kumailpirzada@gmail.com','$2a$10$rRBhKsDcZxzMdp1p8SWgK.nGLRdqsaylQ8fOxnflTxSxLItJ4ZgA.',1,'pic-1522779248735.jpg',4);
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_course`
--

DROP TABLE IF EXISTS `student_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `student_course_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  CONSTRAINT `student_course_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_course`
--

LOCK TABLES `student_course` WRITE;
/*!40000 ALTER TABLE `student_course` DISABLE KEYS */;
INSERT INTO `student_course` VALUES (19,18,3),(21,18,1),(24,18,4);
/*!40000 ALTER TABLE `student_course` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-07 19:13:07
