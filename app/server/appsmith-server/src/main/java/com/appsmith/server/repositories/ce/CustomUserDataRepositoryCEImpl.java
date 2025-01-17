package com.appsmith.server.repositories.ce;

import com.appsmith.server.domains.QUserData;
import com.appsmith.server.domains.UserData;
import com.appsmith.server.dtos.QRecentlyUsedEntityDTO;
import com.appsmith.server.dtos.RecentlyUsedEntityDTO;
import com.appsmith.server.repositories.BaseAppsmithRepositoryImpl;
import com.appsmith.server.repositories.CacheableRepositoryHelper;
import com.mongodb.BasicDBObject;
import org.springframework.data.mongodb.core.ReactiveMongoOperations;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

public class CustomUserDataRepositoryCEImpl extends BaseAppsmithRepositoryImpl<UserData>
        implements CustomUserDataRepositoryCE {

    public CustomUserDataRepositoryCEImpl(
            ReactiveMongoOperations mongoOperations,
            MongoConverter mongoConverter,
            CacheableRepositoryHelper cacheableRepositoryHelper) {
        super(mongoOperations, mongoConverter, cacheableRepositoryHelper);
    }

    @Override
    public Mono<Void> saveReleaseNotesViewedVersion(String userId, String version) {
        return mongoOperations
                .upsert(
                        query(where(fieldName(QUserData.userData.userId)).is(userId)),
                        Update.update(fieldName(QUserData.userData.releaseNotesViewedVersion), version)
                                .setOnInsert(fieldName(QUserData.userData.userId), userId),
                        UserData.class)
                .then();
    }

    @Override
    public Mono<Void> removeIdFromRecentlyUsedList(String userId, String workspaceId, List<String> applicationIds) {
        Update update = new Update().pull(fieldName(QUserData.userData.recentlyUsedWorkspaceIds), workspaceId);
        if (!CollectionUtils.isEmpty(applicationIds)) {
            update = update.pullAll(fieldName(QUserData.userData.recentlyUsedAppIds), applicationIds.toArray());
        }
        update.pull(
                fieldName(QUserData.userData.recentlyUsedEntityIds),
                new BasicDBObject(fieldName(QRecentlyUsedEntityDTO.recentlyUsedEntityDTO.workspaceId), workspaceId));
        return mongoOperations
                .updateFirst(query(where(fieldName(QUserData.userData.userId)).is(userId)), update, UserData.class)
                .then();
    }

    @Override
    public Mono<String> fetchMostRecentlyUsedWorkspaceId(String userId) {
        final Query query = query(where(fieldName(QUserData.userData.userId)).is(userId));

        query.fields().include(fieldName(QUserData.userData.recentlyUsedEntityIds));

        return mongoOperations.findOne(query, UserData.class).map(userData -> {
            final List<RecentlyUsedEntityDTO> recentlyUsedWorkspaceIds = userData.getRecentlyUsedEntityIds();
            return CollectionUtils.isEmpty(recentlyUsedWorkspaceIds)
                    ? ""
                    : recentlyUsedWorkspaceIds.get(0).getWorkspaceId();
        });
    }
}
