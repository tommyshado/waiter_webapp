
CREATE TABLE waiters (
    waiter_id serial not null primary key,
    waiter_name text unique not null
);
create table shifts (
    shift_id serial not null primary key,
    day text unique not null
);
CREATE TABLE availability (
    waiter_id int,
    foreign key (waiter_id) references waiters(waiter_id) on delete cascade,
    waiter_shift text not null,
    foreign key (waiter_shift) references shifts(day) on delete cascade
);