import React from 'react';
import AddCover from './AddCover';
import VCard from './VCard';

export default function CoverForm({className, covers, coverVideoLoading, selectedCover, overlayColor, dataTarget, auth, onSelectCover, onHandleDeleteCover}) {
    const onClickCover = (cover) => {
        onSelectCover(cover);
    }
    const onClickRemove = (cover) => {
        onHandleDeleteCover(cover);
    }

    console.log('covers', covers)
    return (
        <div className={className}>
            <div className="col-6 g-2">
                <AddCover
                    className="rounded-10"
                    width={300}
                    height={180}
                    dataToggle="modal"
                    dataTarget={dataTarget}
                />
            </div>
            {covers.map((cover) => {
                const selected = cover.url === selectedCover;
                const src = cover.thumbnail && cover.thumbnail > '' ? cover.thumbnail : cover.url;

                return (
                    <div key={cover.id} className="col-6 g-2 position-relative">
                        <VCard
                            key={cover.url}
                            blank
                            selected={selected}
                            cover_overlay={overlayColor}
                            cardImage={src}
                            coverVideoLoading={coverVideoLoading}
                            canDelete={cover.user_id == auth.user.id ? true : false}
                            onClick={() => onClickCover(cover)}
                            onClickRemove={() => onClickRemove(cover)} />
                    </div>
                );
            })}
        </div>
    );
}