--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: plant_growth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant_growth (
    id integer NOT NULL,
    plant_id integer,
    height_cm numeric(5,2),
    growth_stage character varying(100),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.plant_growth OWNER TO postgres;

--
-- Name: plant_growth_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plant_growth_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plant_growth_id_seq OWNER TO postgres;

--
-- Name: plant_growth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plant_growth_id_seq OWNED BY public.plant_growth.id;


--
-- Name: plants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plants (
    id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    species character varying(255),
    pot_size numeric(5,2),
    location character varying(255),
    soil_moisture_threshold numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    recommended_soil_moisture numeric(5,2) DEFAULT 40.00 NOT NULL
);


ALTER TABLE public.plants OWNER TO postgres;

--
-- Name: plants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plants_id_seq OWNER TO postgres;

--
-- Name: plants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plants_id_seq OWNED BY public.plants.id;


--
-- Name: soil_moisture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil_moisture (
    id integer NOT NULL,
    plant_id integer,
    moisture_level numeric(5,2),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.soil_moisture OWNER TO postgres;

--
-- Name: soil_moisture_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.soil_moisture_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.soil_moisture_id_seq OWNER TO postgres;

--
-- Name: soil_moisture_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.soil_moisture_id_seq OWNED BY public.soil_moisture.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    username character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: watering_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watering_history (
    id integer NOT NULL,
    plant_id integer,
    watered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    amount_ml numeric(6,2),
    method character varying(50),
    weather_condition character varying(255),
    CONSTRAINT watering_history_method_check CHECK (((method)::text = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying, 'rain'::character varying])::text[])))
);


ALTER TABLE public.watering_history OWNER TO postgres;

--
-- Name: watering_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.watering_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.watering_history_id_seq OWNER TO postgres;

--
-- Name: watering_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.watering_history_id_seq OWNED BY public.watering_history.id;


--
-- Name: watering_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watering_schedules (
    id integer NOT NULL,
    plant_id integer,
    schedule_type character varying(50),
    frequency integer NOT NULL,
    last_watered timestamp without time zone,
    next_watering timestamp without time zone,
    CONSTRAINT watering_schedules_schedule_type_check CHECK (((schedule_type)::text = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying])::text[])))
);


ALTER TABLE public.watering_schedules OWNER TO postgres;

--
-- Name: watering_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.watering_schedules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.watering_schedules_id_seq OWNER TO postgres;

--
-- Name: watering_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.watering_schedules_id_seq OWNED BY public.watering_schedules.id;


--
-- Name: weather_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weather_logs (
    id integer NOT NULL,
    user_id integer,
    temperature numeric(5,2),
    humidity numeric(5,2),
    rainfall numeric(5,2),
    logged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.weather_logs OWNER TO postgres;

--
-- Name: weather_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weather_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weather_logs_id_seq OWNER TO postgres;

--
-- Name: weather_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weather_logs_id_seq OWNED BY public.weather_logs.id;


--
-- Name: plant_growth id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_growth ALTER COLUMN id SET DEFAULT nextval('public.plant_growth_id_seq'::regclass);


--
-- Name: plants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants ALTER COLUMN id SET DEFAULT nextval('public.plants_id_seq'::regclass);


--
-- Name: soil_moisture id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_moisture ALTER COLUMN id SET DEFAULT nextval('public.soil_moisture_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: watering_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_history ALTER COLUMN id SET DEFAULT nextval('public.watering_history_id_seq'::regclass);


--
-- Name: watering_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_schedules ALTER COLUMN id SET DEFAULT nextval('public.watering_schedules_id_seq'::regclass);


--
-- Name: weather_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_logs ALTER COLUMN id SET DEFAULT nextval('public.weather_logs_id_seq'::regclass);


--
-- Data for Name: plant_growth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plant_growth (id, plant_id, height_cm, growth_stage, recorded_at) FROM stdin;
1	1	25.50	Seedling	2025-02-16 12:55:19.997655
2	2	30.00	Vegetative	2025-02-16 12:55:33.000506
\.


--
-- Data for Name: plants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plants (id, user_id, name, species, pot_size, location, soil_moisture_threshold, created_at, recommended_soil_moisture) FROM stdin;
1	1	Cactus	Cactus	15.50	Indoor	30.00	2025-02-16 12:51:28.392932	40.00
2	1	Basil	Basil	12.00	Outdoor	25.00	2025-02-16 12:51:44.162474	45.00
3	1	Fern	Fern	20.00	Indoor	35.00	2025-02-16 12:52:04.229402	50.00
\.


--
-- Data for Name: soil_moisture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil_moisture (id, plant_id, moisture_level, recorded_at) FROM stdin;
1	1	38.00	2025-02-16 12:55:49.44794
2	2	43.50	2025-02-16 12:56:01.857864
3	3	50.00	2025-02-16 12:56:17.297089
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, created_at, username) FROM stdin;
1	testuser@example.com	hashedpassword123	2025-02-16 12:50:16.824876	default_username
\.


--
-- Data for Name: watering_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watering_history (id, plant_id, watered_at, amount_ml, method, weather_condition) FROM stdin;
1	1	2025-02-01 12:00:00	150.00	manual	sunny
2	2	2025-02-01 08:00:00	100.00	automatic	cloudy
3	3	2025-02-02 10:00:00	120.00	manual	rainy
\.


--
-- Data for Name: watering_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watering_schedules (id, plant_id, schedule_type, frequency, last_watered, next_watering) FROM stdin;
1	1	manual	7	2025-02-01 12:00:00	2025-02-08 12:00:00
2	2	automatic	3	2025-02-01 08:00:00	2025-02-04 08:00:00
3	3	manual	5	2025-02-02 10:00:00	2025-02-07 10:00:00
\.


--
-- Data for Name: weather_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weather_logs (id, user_id, temperature, humidity, rainfall, logged_at) FROM stdin;
1	1	23.50	65.00	12.00	2025-02-16 12:55:04.996562
\.


--
-- Name: plant_growth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plant_growth_id_seq', 2, true);


--
-- Name: plants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.plants_id_seq', 3, true);


--
-- Name: soil_moisture_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.soil_moisture_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: watering_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watering_history_id_seq', 3, true);


--
-- Name: watering_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watering_schedules_id_seq', 3, true);


--
-- Name: weather_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weather_logs_id_seq', 1, true);


--
-- Name: plant_growth plant_growth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_growth
    ADD CONSTRAINT plant_growth_pkey PRIMARY KEY (id);


--
-- Name: plants plants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_pkey PRIMARY KEY (id);


--
-- Name: soil_moisture soil_moisture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_moisture
    ADD CONSTRAINT soil_moisture_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: watering_history watering_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_history
    ADD CONSTRAINT watering_history_pkey PRIMARY KEY (id);


--
-- Name: watering_schedules watering_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_schedules
    ADD CONSTRAINT watering_schedules_pkey PRIMARY KEY (id);


--
-- Name: weather_logs weather_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_logs
    ADD CONSTRAINT weather_logs_pkey PRIMARY KEY (id);


--
-- Name: plant_growth plant_growth_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_growth
    ADD CONSTRAINT plant_growth_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: plants plants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plants
    ADD CONSTRAINT plants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: soil_moisture soil_moisture_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_moisture
    ADD CONSTRAINT soil_moisture_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: watering_history watering_history_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_history
    ADD CONSTRAINT watering_history_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: watering_schedules watering_schedules_plant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watering_schedules
    ADD CONSTRAINT watering_schedules_plant_id_fkey FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;


--
-- Name: weather_logs weather_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_logs
    ADD CONSTRAINT weather_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

