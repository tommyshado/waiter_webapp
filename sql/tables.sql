CREATE TABLE workers (
    id serial not null primary key,
    name text unique not null,
    role text not null
);

CREATE TABLE selected_days (
    waiters_id int,
    foreign key (waiters_id) references workers(id) ON DELETE CASCADE,
    selected_day text not null
);