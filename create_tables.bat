@echo off
REM Script para crear las tablas de metas en MySQL

echo Creando tablas de metas en la base de datos...

REM Ejecuta MySQL con el SQL
mysql -u root investment-tracker << EOF

CREATE TABLE IF NOT EXISTS financial_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount_cents BIGINT NOT NULL CHECK (target_amount_cents > 0),
  current_amount_cents BIGINT NOT NULL DEFAULT 0 CHECK (current_amount_cents >= 0),
  monthly_savings_cents BIGINT NOT NULL DEFAULT 0 CHECK (monthly_savings_cents >= 0),
  deadline DATE NOT NULL,
  status ENUM('en_progreso', 'completada', 'pausada') DEFAULT 'en_progreso',
  priority ENUM('baja', 'media', 'alta') DEFAULT 'media',
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline),
  INDEX idx_priority (priority)
);

CREATE TABLE IF NOT EXISTS goal_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goal_id INT NOT NULL,
  current_amount_cents BIGINT NOT NULL,
  progress_percentage DECIMAL(5, 2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (goal_id) REFERENCES financial_goals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_goal_date (goal_id, recorded_at),
  INDEX idx_goal_id (goal_id)
);

EOF

echo Tablas creadas exitosamente
pause
