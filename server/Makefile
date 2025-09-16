.PHONY: up down logs seed test lint format clean

# Docker commands
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f backend

# Development commands
dev:
	npm run dev

seed:
	npm run seed:all

test:
	npm test

test-watch:
	npm run test:watch

coverage:
	npm run test:coverage

# Code quality
lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

# ML commands
train:
	npm run train

# Cleanup
clean:
	docker-compose down -v
	docker system prune -f

# Setup
install:
	npm install

setup: install
	cp .env.example .env
	@echo "Please edit .env file with your configuration"

# Full reset
reset: clean setup
	docker-compose up -d
	sleep 10
	npm run seed:all
