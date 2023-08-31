CREATE TABLE workers (
    id serial not null primary key,
    name text unique not null,
    role text not null
);

CREATE TABLE selected_days (
    waiters_name int,
    foreign key (waiters_name) references workers(name) ON DELETE CASCADE,
    selected_day text not null
);