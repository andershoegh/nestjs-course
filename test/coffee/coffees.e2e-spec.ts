import {
  HttpServer,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee-dto/create-coffee-dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/create-coffee-dto/update-coffee.dto';

describe('[Feature] Coffees - /coffees', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  const coffee = {
    name: 'Shipwreck Roast',
    title: 'Best of shipwreck',
    brand: 'Buddy brew',
    flavors: ['chocolate', 'vanilla'],
  };

  const expectedPartialCoffee = expect.objectContaining({
    ...coffee,
    countryOfOrigin: null,
    description: null,
    flavors: expect.arrayContaining(
      coffee.flavors.map((name) => expect.objectContaining({ name })),
    ),
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
    httpServer = app.getHttpServer();
  });

  it.only('Create [POST /]', () => {
    return request(httpServer)
      .post('/coffees')
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        expect(body).toEqual(expectedPartialCoffee);
      });
  });

  it('Get all [GET /]', () => {
    return request(httpServer)
      .get('/coffees')
      .then(({ body }) => {
        console.log(body);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toEqual(expectedPartialCoffee);
      });
  });
  it('Get one [GET /:id]', () => {
    return request(httpServer)
      .get('/coffees/1')
      .then(({ body }) => {
        expect(body).toEqual(expectedPartialCoffee);
      });
  });

  it('Update one [PATCH /:id]', () => {
    const updateCoffeeDto: UpdateCoffeeDto = {
      ...coffee,
      brand: 'New brand',
    };
    return request(httpServer)
      .patch('/coffees/1')
      .send(updateCoffeeDto)
      .then(({ body }) => {
        expect(body.brand).toEqual(updateCoffeeDto.brand);

        return request(httpServer)
          .get('/coffees/1')
          .then(({ body }) => {
            expect(body.brand).toEqual(updateCoffeeDto.name);
          });
      });
  });
  it('Delete one [DELETE /:id]', () => {
    return request(httpServer)
      .delete('/coffees/1')
      .expect(HttpStatus.OK)
      .then(() => {
        return request(httpServer)
          .get('/coffees/1')
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
