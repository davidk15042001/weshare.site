export default function Project({
    attachment,
    title,
    description,
    link,
    company,
    month,
    year,
    size,
    onClickImage,
}) {
    return (
        <div className="mb-3">
            <div
                onClick={() =>
                    onClickImage({
                        attachment,
                        title,
                        description,
                        link,
                        company,
                        month,
                        year,
                        onClickImage,
                    })
                }
                className="w-100 mb-2 bg-light rounded-10"
                style={{
                    height: size,
                    overflow: "hidden",
                    backgroundImage: `url('${attachment}')`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    cursor: "pointer",
                }}
            />
            {link !== "" ? (
                <a
                    href={
                        link.indexOf('http://') == -1 && link.indexOf('https://') == -1
                            ? `https://${link}`
                            : link
                    }
                    target="_blank"
                    className="fw-bold text-decoration-none text-primary"
                >
                    {title}
                </a>
            ) : (
                <div className="fs-reg fw-bold">{title}</div>
            )}
            <div className="fs-reg">{description}</div>
            <div className="fs-reg">
                {company} - {month} {year}
            </div>
        </div>
    );
}
