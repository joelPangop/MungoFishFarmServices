CREATE SCHEMA IF NO EXISTS `mungo_fish_db`;

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `roleName` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`user_infos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(100) NULL,
  `lastname` VARCHAR(100) NULL,
  `gender` VARCHAR(45) NULL,
  `birthday` DATE NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`roles` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `roleName` VARCHAR(45) NULL,
 PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userName` VARCHAR(45) NULL,
  `email` VARCHAR(45) NULL,
  `password` VARCHAR(100) NULL,
  `userInfoID` INT NULL,
  `roleID` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_role_idx` (`roleID` ASC),
  INDEX `fk_userinfos_idx` (`userInfoID` ASC),
  CONSTRAINT `fk_role`
    FOREIGN KEY (`roleID`)
    REFERENCES `mungo_fish_db`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_userinfos`
    FOREIGN KEY (`userInfoID`)
    REFERENCES `mungo_fish_db`.`user_infos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_supervisor`
      FOREIGN KEY (`supervisorID`)
      REFERENCES `mungo_fish_db`.`users` (`id`)
      ON DELETE NO ACTION
         ON UPDATE NO ACTION);

	
CREATE TABLE IF NO EXISTS `mungo_fish_db`.`telephones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `telephone_number` VARCHAR(45) NULL,
  `telephone_category` VARCHAR(45) NULL,
  `userInfosID` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_telephone_user_idx` (`userInfosID` ASC),
  CONSTRAINT `fk_telephone_user`
    FOREIGN KEY (`userInfosID`)
    REFERENCES `mungo_fish_db`.`user_infos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
	
CREATE TABLE IF NO EXISTS `mungo_fish_db`.`addresses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `addr_1` VARCHAR(100) NULL,
  `addr_2` VARCHAR(100) NULL,
  `appart_num` INT NULL,
  `town` VARCHAR(45) NULL,
  `country` VARCHAR(45) NULL,
  `region` VARCHAR(45) NULL,
  `postal_code` VARCHAR(45) NULL,
  `userInfosID` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_address_userinfos_idx` (`userInfosID` ASC),
  CONSTRAINT `fk_address_userinfos`
    FOREIGN KEY (`userInfosID`)
    REFERENCES `mungo_fish_db`.`user_infos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`sites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`tanks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `siteID` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_tank_idx` (`siteID` ASC),
  CONSTRAINT `fk_tank`
    FOREIGN KEY (`siteID`)
    REFERENCES `mungo_fish_db`.`sites` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`tank_products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `qtyProduct` INT NULL,
  `type` VARCHAR(100) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`products` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  `prix` DOUBLE NULL,
  `sale_quantity` INT NULL,
  `weight` FLOAT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NO EXISTS `mungo_fish_db`.`daily_feedbacks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tankID` INT NULL,
  `date` VARCHAR(45) NULL,
  `productID` INT NULL,
  `qtyAlmt09AM` INT NULL,
  `qtyAlmt12PM` INT NULL,
  `qtyAlmt03PM` INT NULL,
  `quantity` INT NULL,
  `cumulAlmt` INT NULL,
  `nbMale` INT NULL,
  `nbFemale` INT NULL,
  `temp06AM` FLOAT NULL,
  `temp03PM` FLOAT NULL,
  `oxyg06AM` FLOAT NULL,
  `oxyg03PM` FLOAT NULL,
  `nh3` FLOAT NULL,
  `nh2` FLOAT NULL,
  `ph` FLOAT NULL,
  `remark` VARCHAR(1000) NULL,
  `qtyProd` BIGINT NULL,
  `submitted` TINYINT(1) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_daily_feedback_product_idx` (`productID` ASC),
  INDEX `fk_daily_feedback_tank_idx` (`tankID` ASC),
  CONSTRAINT `fk_daily_feedback_product`
    FOREIGN KEY (`productID`)
    REFERENCES `mungo_fish_db`.`tank_products` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_daily_feedback_tank`
    FOREIGN KEY (`tankID`)
    REFERENCES `mungo_fish_db`.`tanks` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `mungo_fish_db`.`refreshtokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NULL,
  `expires` DATETIME NULL,
  `created` DATETIME NULL,
  `createByIp` VARCHAR(100) NULL,
  `revoked` DATETIME NULL,
  `revokedByIp` VARCHAR(100) NULL,
  `replacedByToken` VARCHAR(100) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `mungo_fish_db`.`nets` (
 `numNet` INT NULL,
 `tankID` INT NULL,
 PRIMARY KEY (`numNet`),
 INDEX `fk_net_tank_idx` (`tankID` ASC),
 CONSTRAINT `fk_net_tank`
     FOREIGN KEY (`tankID`)
         REFERENCES `mungo_fish_db`.`tanks` (`id`)
         ON DELETE NO ACTION
         ON UPDATE NO ACTION);

CREATE TABLE `mungo_fish_db`.`change_logs` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `user` VARCHAR(255) NULL,
 `entity` VARCHAR(255) NULL,
 `operation` VARCHAR(45) NULL,
 `dateTime` DATETIME NULL,
 `data` VARCHAR(1000) NULL,
 `delta` VARCHAR(1000) NULL,
 PRIMARY KEY (`id`));

CREATE TABLE `mungo_fish_db`.`mails` (
`id` INT NOT NULL AUTO_INCREMENT,
`to` VARCHAR(100) NULL,
`from` VARCHAR(100) NULL,
`subject` VARCHAR(255) NULL,
`text` VARCHAR(1000) NULL,
PRIMARY KEY (`id`));

CREATE TABLE `mungo_fish_db`.`devices` (
`id` INT NOT NULL AUTO_INCREMENT,
`appBuild` VARCHAR(100) NULL,
`appId` VARCHAR(100) NULL,
`appName` VARCHAR(100) NULL,
`appVersion` VARCHAR(100) NULL,
`isVirtual` TINYINT(1) NULL,
`manufacturer` VARCHAR(100) NULL,
`model` VARCHAR(100) NULL,
`operatingSystem` VARCHAR(100) NULL,
`osVersion` VARCHAR(100) NULL,
`uuid` VARCHAR(100) NULL,
`userInfosID` VARCHAR(100) NULL,
PRIMARY KEY (`id`));

CREATE TABLE `mungo_fish_db`.`approbations` (
 `id` INT(20) NOT NULL AUTO_INCREMENT,
 `daily_feedbackID` INT NULL,
 `userID` INT NULL,
 `supervisorID` INT NULL,
 `status` VARCHAR(45) NULL,
 `createdAt` DATETIME NULL,
 `approvedAt` DATETIME NULL,
 `rejectedAt` DATETIME NULL,
 `remark` VARCHAR(1000) NULL,
 PRIMARY KEY (`id`),
 INDEX `fk_approbation_df_idx` (`daily_feedbackID` ASC),
 INDEX `fk_approbation_user_idx` (`userID` ASC),
 INDEX `fk_approbation_supervisor_idx` (`supervisorID` ASC),
 CONSTRAINT `fk_approbation_df`
     FOREIGN KEY (`daily_feedbackID`)
         REFERENCES `mungo_fish_db`.`daily_feedbacks` (`id`)
         ON DELETE NO ACTION
         ON UPDATE NO ACTION,
 CONSTRAINT `fk_approbation_user`
     FOREIGN KEY (`userID`)
         REFERENCES `mungo_fish_db`.`users` (`id`)
         ON DELETE NO ACTION
         ON UPDATE NO ACTION,
 CONSTRAINT `fk_approbation_supervisor`
     FOREIGN KEY (`supervisorID`)
         REFERENCES `mungo_fish_db`.`users` (`id`)
         ON DELETE NO ACTION
         ON UPDATE NO ACTION);

ALTER TABLE `mungo_fish_db`.`nets`
    DROP FOREIGN KEY `fk_net_tank`;
ALTER TABLE `mungo_fish_db`.`nets`
    CHANGE COLUMN `tankID` `tankID` INT(11) NOT NULL ,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (`numNet`, `tankID`);
;
ALTER TABLE `mungo_fish_db`.`nets`
    ADD CONSTRAINT `fk_net_tank`
        FOREIGN KEY (`tankID`)
            REFERENCES `mungo_fish_db`.`tanks` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION;
